import { Tolgee, BackendFetch, DevTools } from '@tolgee/react';
import { FormatIcu } from "@tolgee/format-icu";

let tolgee;

const primaryLanguage = 'en';

if (import.meta.env.MODE === 'development') {
  tolgee = Tolgee()
    .use(FormatIcu())
    .use(BackendFetch())
    .use(DevTools())
    .init({
      apiKey: import.meta.env.VITE_TOLGEE_API_KEY,
      apiUrl: import.meta.env.VITE_TOLGEE_API_URL,
      projectId: import.meta.env.VITE_TOLGEE_PROJECT_ID,
      language: primaryLanguage,
      fallbackLanguage: primaryLanguage,
    });
} else {
  const staticData = {};

  const localeModules = import.meta.glob('../../../locales/*.json');
  const supportedLanguages = Object.keys(localeModules).map(path => {

    return path.split('/').pop().replace('.json', '');
  });

  supportedLanguages.forEach(lang => {
    staticData[lang] = () => import(`../../../locales/${lang}.json`);
  });


  tolgee = Tolgee()
    .use(FormatIcu())
    .init({
      language: primaryLanguage,
      staticData,
    });
}

export default tolgee;