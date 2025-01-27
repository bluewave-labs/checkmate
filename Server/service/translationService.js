import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { formattedKey } from '../utils/formattedKey.js';

class TranslationService {
  static SERVICE_NAME = 'TranslationService';

  constructor(logger) {
    this.logger = logger;
    this.translations = {};
    this.apiToken = process.env.POEDITOR_API_TOKEN;
    this.projectId = process.env.POEDITOR_PROJECT_ID;
    this.baseUrl = 'https://api.poeditor.com/v2';
    this.localesDir = path.join(process.cwd(), 'locales');
  }

  async initialize() {
    try {
      const loadedFromFiles = await this.loadFromFiles();

      if (!loadedFromFiles) {
        await this.loadTranslations();
      }
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
    try {
      const languages = await this.getLanguages();

      for (const language of languages) {
        const translations = await this.exportTranslations(language);
        this.translations[language] = translations;
      }

      await this.saveTranslations();
    } catch (error) {
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
      const params = new URLSearchParams();
      params.append('api_token', this.apiToken);
      params.append('id', this.projectId);

      const response = await axios.post(`${this.baseUrl}/languages/list`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data.result.languages.map(lang => lang.code);
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
      const params = new URLSearchParams();
      params.append('api_token', this.apiToken);
      params.append('id', this.projectId);
      params.append('language', language);
      params.append('type', 'key_value_json');

      const exportResponse = await axios.post(`${this.baseUrl}/projects/export`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { url } = exportResponse.data.result;

      const translationsResponse = await axios.get(url);
      return translationsResponse.data;
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

  getTranslation(key, language = 'en') {
    const formattedKeyText = formattedKey(key);
    try {
      return this.translations[language]?.[formattedKeyText] || this.translations['en']?.[formattedKeyText] || formattedKeyText;
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
}

export default TranslationService; 