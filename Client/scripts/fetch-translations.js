/* eslint-disable no-undef */
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const apiKey = process?.env?.VITE_TOLGEE_API_KEY;
const apiUrl = process?.env?.VITE_TOLGEE_API_URL;
const projectId = process?.env?.VITE_TOLGEE_PROJECT_ID;

const localesDir = path.resolve('../locales');

async function fetchTranslations() {
  try {
    // Create locales directory if it doesn't exist
    await fs.mkdir(localesDir, { recursive: true });

    // First get languages
    const languagesResponse = await fetch(
      `${apiUrl}/v2/projects/${projectId}/languages`,
      {
        headers: {
          'X-API-Key': apiKey,
        },
      }
    );

    if (!languagesResponse.ok) {
      throw new Error(`HTTP error! status: ${languagesResponse.status}`);
    }

    const languagesData = await languagesResponse.json();
    const languages = languagesData._embedded.languages.map(lang => lang.tag);

    // Download translations for each language
    for (const lang of languages) {
      const response = await fetch(
        `${apiUrl}/v2/projects/${projectId}/translations/${lang}`,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const filePath = path.join(localesDir, `${lang}.json`);

      await fs.writeFile(filePath, JSON.stringify(data[lang], null, 2));
      console.log(`Successfully downloaded translations for ${lang}`);
    }
  } catch (error) {
    console.error('Error fetching translations:', error);
    process.exit(1);
  }
}

fetchTranslations(); 