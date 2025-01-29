import fs from 'fs';
import path from 'path';

class TranslationService {
  static SERVICE_NAME = 'TranslationService';

  constructor(logger, networkService) {
    this.logger = logger;
    this.networkService = networkService;
    this.translations = {};
    this._language = 'en';
    this.localesDir = path.join(process.cwd(), 'locales');
  }

  setLanguage(language) {
    this._language = language;
  }

  get language() {
    return this._language;
  }

  async initialize() {
    try {
      await this.loadTranslations();

      // Yeni eklenen terimleri POEditor'e gönder
      await this.syncTermsWithPOEditor();
    } catch (error) {
      this.logger.error({
        message: error.message,
        service: 'TranslationService',
        method: 'initialize',
        stack: error.stack
      });
    }
  }

  async loadFromFiles() {
    try {
      if (!fs.existsSync(this.localesDir)) {
        return false;
      }

      const files = fs.readdirSync(this.localesDir).filter(file => file.endsWith('.json'));

      if (files.length === 0) {
        return false;
      }

      for (const file of files) {
        const language = file.replace('.json', '');
        const filePath = path.join(this.localesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        this.translations[language] = JSON.parse(content);
      }

      this.logger.info({
        message: 'Translations loaded from files successfully',
        service: 'TranslationService',
        method: 'loadFromFiles'
      });

      return true;
    } catch (error) {
      this.logger.error({
        message: error.message,
        service: 'TranslationService',
        method: 'loadFromFiles',
        stack: error.stack
      });
      return false;
    }
  }

  async loadTranslations() {
    let hasError = false;
    try {
      const languages = await this.getLanguages();

      for (const language of languages) {
        try {
          const translations = await this.exportTranslations(language);
          this.translations[language] = translations;
        } catch (error) {
          hasError = true;
          this.logger.error({
            message: `Failed to fetch translations from POEditor for language ${language}: ${error.message}`,
            service: 'TranslationService',
            method: 'loadTranslations',
            stack: error.stack
          });
        }
      }

      if (hasError || Object.keys(this.translations[this._language]).length === 0) {
        this.logger.error({
          message: 'Failed to fetch translations from POEditor, using locales_en.json',
          service: 'TranslationService',
          method: 'loadTranslations'
        });


        // Load translations from locales_en.json in utils directory
        const utilsPath = path.join(process.cwd(), 'utils');
        const utilsFilePath = path.join(utilsPath, 'locales_en.json');
        if (fs.existsSync(utilsFilePath)) {
          const content = fs.readFileSync(utilsFilePath, 'utf8');
          this.translations['en'] = JSON.parse(content);
        } else {
          throw new Error('locales_en.json file not found');
        }
      }

      await this.saveTranslations();
    } catch (error) {
      hasError = true;
      this.logger.error({
        message: error.message,
        service: 'TranslationService',
        method: 'loadTranslations',
        stack: error.stack
      });
    }
  }

  async getLanguages() {
    try {
      return await this.networkService.getPoEditorLanguages();
    } catch (error) {
      this.logger.error({
        message: error.message,
        service: 'TranslationService',
        method: 'getLanguages',
        stack: error.stack
      });
      return ['en'];
    }
  }

  async exportTranslations(language) {
    try {
      return await this.networkService.exportPoEditorTranslations(language);
    } catch (error) {
      this.logger.error({
        message: error.message,
        service: 'TranslationService',
        method: 'exportTranslations',
        stack: error.stack
      });
      return {};
    }
  }

  async saveTranslations() {
    try {
      if (!fs.existsSync(this.localesDir)) {
        fs.mkdirSync(this.localesDir);
      }

      for (const [language, translations] of Object.entries(this.translations)) {
        const filePath = path.join(this.localesDir, `${language}.json`);
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
      }

      const utilsPath = path.join(process.cwd(), 'utils');
      const enTranslations = this.translations['en'] || {};
      const utilsFilePath = path.join(utilsPath, 'locales_en.json');
      fs.writeFileSync(utilsFilePath, JSON.stringify(enTranslations, null, 2));

      this.logger.info({
        message: 'Translations saved to files successfully',
        service: 'TranslationService',
        method: 'saveTranslations'
      });
    } catch (error) {
      this.logger.error({
        message: error.message,
        service: 'TranslationService',
        method: 'saveTranslations',
        stack: error.stack
      });
    }
  }

  getTranslation(key) {
    let language = this._language;

    try {
      return this.translations[language]?.[key] || this.translations['en']?.[key] || key;
    } catch (error) {
      this.logger.error({
        message: error.message,
        service: 'TranslationService',
        method: 'getTranslation',
        stack: error.stack
      });
      return key;
    }
  }

  async getTermsFromPOEditor() {
    try {
      return await this.networkService.getPoEditorTerms();
    } catch (error) {
      this.logger.error({
        message: error.message,
        service: 'TranslationService',
        method: 'getTermsFromPOEditor',
        stack: error.stack
      });
      return [];
    }
  }

  async addTermsToPOEditor(terms) {
    try {
      if (!terms.length) return;

      const response = await this.networkService.addPoEditorTerms(terms);

      if (response.response?.status === 'fail') {
        throw new Error(response.response.message || 'Failed to add terms to POEditor');
      }

      this.logger.info({
        message: `${terms.length} new terms added to POEditor`,
        service: 'TranslationService',
        method: 'addTermsToPOEditor',
        response: response
      });

      return response;
    } catch (error) {
      this.logger.error({
        message: `Failed to add terms to POEditor: ${error.message}`,
        service: 'TranslationService',
        method: 'addTermsToPOEditor',
        stack: error.stack,
        terms: terms
      });
      throw error;
    }
  }

  async syncTermsWithPOEditor() {
    try {
      const utilsPath = path.join(process.cwd(), 'utils');
      const utilsFilePath = path.join(utilsPath, 'locales_en.json');
      const enTranslations = JSON.parse(fs.readFileSync(utilsFilePath, 'utf8'));
      const localTerms = Object.keys(enTranslations)
        .map(term => term);

      const poeditorTerms = await this.getTermsFromPOEditor();

      const newTerms = localTerms?.filter(term => !poeditorTerms?.includes(term));


      this.logger.info({
        message: `Comparison results - New terms found: ${newTerms.length}`,
        sampleNewTerms: newTerms.slice(0, 5),
        service: 'TranslationService',
        method: 'syncTermsWithPOEditor'
      });

      if (newTerms.length > 0) {
        const formattedTerms = newTerms.map(term => ({
          [term]: enTranslations[term] || '',
        }));

        await this.addTermsToPOEditor(formattedTerms);

      } else {
        this.logger.info({
          message: 'No new terms found to synchronize',
          service: 'TranslationService',
          method: 'syncTermsWithPOEditor'
        });
      }
    } catch (error) {
      this.logger.error({
        message: error.message,
        service: 'TranslationService',
        method: 'syncTermsWithPOEditor',
        stack: error.stack
      });
    }
  }
}

export default TranslationService; 