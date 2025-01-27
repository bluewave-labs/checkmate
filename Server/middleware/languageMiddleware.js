const languageMiddleware = (req, res, next) => {
  const acceptLanguage = req.headers['accept-language'] || 'en';

  req.language = acceptLanguage.split(',')[0].slice(0, 2).toLowerCase();

  next();
};

export default languageMiddleware; 