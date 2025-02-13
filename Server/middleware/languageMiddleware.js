const languageMiddleware = (stringService, translationService) => (req, res, next) => {
  const acceptLanguage = req.headers['accept-language'] || 'en';
  const language = acceptLanguage.split(',')[0].slice(0, 2).toLowerCase();

  translationService.setLanguage(language);
  stringService.setLanguage(language);

  next();
};

export default languageMiddleware; 