/* eslint-disable no-undef */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const POEDITOR_API_DOMAIN = 'https://api.poeditor.com/v2';
const API_TOKEN = process.env.VITE_POEDITOR_API_TOKEN;
const PROJECT_ID = process.env.VITE_POEDITOR_PROJECT_ID;

const LOCALES_DIR = path.join(process.cwd(), './public/locales');

async function fetchLanguages() {
  const response = await fetch(`${POEDITOR_API_DOMAIN}/languages/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      api_token: API_TOKEN,
      id: PROJECT_ID,
    }),
  });

  const data = await response.json();

  return data.result.languages;
}

async function fetchTranslations(languageCode) {
  const response = await fetch(`${POEDITOR_API_DOMAIN}/terms/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      api_token: API_TOKEN,
      id: PROJECT_ID,
      language: languageCode,
    }),
  });

  const data = await response.json();
  return data.result.terms.reduce((acc, term) => {
    acc[term.term] = term.translation.content;
    return acc;
  }, {});
}

async function main() {
  try {
    // Create locales directory if it doesn't exist
    if (!fs.existsSync(LOCALES_DIR)) {
      fs.mkdirSync(LOCALES_DIR, { recursive: true });
    }

    // Fetch available languages
    const languages = await fetchLanguages();
    console.log('Available languages:', languages.map(lang => lang.code));

    // Fetch translations for each language
    for (const language of languages) {
      const translations = await fetchTranslations(language.code);

      // Create language file
      const filePath = path.join(LOCALES_DIR, `${language.code}.json`);
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));

      console.log(`✓ Created translations for ${language.code}`);
    }

    console.log('\nTranslations fetched successfully!');
  } catch (error) {
    console.error('Error fetching translations:', error);
    process.exit(1);
  }
}

main();
