import { Request, Response, NextFunction } from 'express';

// Extend Express Request object to include locale
declare global {
  namespace Express {
    interface Request {
      locale?: string;
    }
  }
}

export const languageMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Try to get lang from query param first, then Accept-Language header
  const langQuery = req.query.lang as string;
  const acceptLanguage = req.headers['accept-language'] as string;
  
  let locale = 'en'; // default
  
  if (langQuery) {
    locale = (langQuery.split('-')[0] || 'en').toLowerCase();
  } else if (acceptLanguage) {
    // e.g. "en-US,en;q=0.9,hi;q=0.8" -> "en-US" -> "en"
    const firstLang = acceptLanguage.split(',')[0] || '';
    locale = (firstLang.split('-')[0] || 'en').toLowerCase();
  }
  
  // Supported languages list (matching frontend)
  const supported = ['en', 'hi', 'mr', 'gu', 'pa', 'ta', 'te', 'kn', 'ml', 'bn', 'ur', 'or'];
  
  if (supported.includes(locale)) {
    req.locale = locale;
  } else {
    req.locale = 'en';
  }
  
  next();
};
