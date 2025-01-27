import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { formattedKey } from '../utils/formattedKey.js';

class TranslationService {
  static SERVICE_NAME = 'TranslationService';

  constructor(logger) {
    this.logger = logger;
    this.translations = {};
    this.apiToken = "ddf8d5fdbe1baa12bb3b5519b639d00a";
    this.projectId = "757606";
    this.baseUrl = 'https://api.poeditor.com/v2';
    this.localesDir = path.join(process.cwd(), 'locales');
  }

  async initialize() {
    try {
      // Önce dosyalardan okumayı dene
      const loadedFromFiles = await this.loadFromFiles();

      // Eğer dosyalardan yüklenemezse veya dosyalar yoksa POEditor'dan çek
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
      // locales klasörü yoksa false dön
      if (!fs.existsSync(this.localesDir)) {
        return false;
      }

      // Klasördeki tüm .json dosyalarını oku
      const files = fs.readdirSync(this.localesDir).filter(file => file.endsWith('.json'));

      if (files.length === 0) {
        return false;
      }

      // Her dosyayı oku ve translations objesine ekle
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
      // Önce mevcut dilleri al
      const languages = await this.getLanguages();

      // Her dil için çevirileri indir
      for (const language of languages) {
        const translations = await this.exportTranslations(language);
        this.translations[language] = translations;
      }

      // Çevirileri dosyaya kaydet
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
      return ['en']; // Varsayılan olarak İngilizce
    }
  }

  async exportTranslations(language) {
    try {
      const params = new URLSearchParams();
      params.append('api_token', this.apiToken);
      params.append('id', this.projectId);
      params.append('language', language);
      params.append('type', 'key_value_json');

      // Export isteği
      const exportResponse = await axios.post(`${this.baseUrl}/projects/export`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // İndirme URL'sini al
      const { url } = exportResponse.data.result;

      // Çevirileri indir
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
      // locales klasörü yoksa oluştur
      if (!fs.existsSync(this.localesDir)) {
        fs.mkdirSync(this.localesDir);
      }

      // Her dil için JSON dosyası oluştur
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
    // Convert key from AUTH_INCORRECT_PASSWORD format to authIncorrectPassword format
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