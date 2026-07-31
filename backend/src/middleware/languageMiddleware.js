"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languageMiddleware = void 0;
const languageMiddleware = (req, res, next) => {
    // Try to get lang from query param first, then Accept-Language header
    const langQuery = req.query.lang;
    const acceptLanguage = req.headers['accept-language'];
    let locale = 'en'; // default
    if (langQuery) {
        locale = (langQuery.split('-')[0] || 'en').toLowerCase();
    }
    else if (acceptLanguage) {
        // e.g. "en-US,en;q=0.9,hi;q=0.8" -> "en-US" -> "en"
        const firstLang = acceptLanguage.split(',')[0] || '';
        locale = (firstLang.split('-')[0] || 'en').toLowerCase();
    }
    // Supported languages list (matching frontend)
    const supported = ['en', 'hi', 'mr', 'gu', 'pa', 'ta', 'te', 'kn', 'ml', 'bn', 'ur', 'or'];
    if (supported.includes(locale)) {
        req.locale = locale;
    }
    else {
        req.locale = 'en';
    }
    next();
};
exports.languageMiddleware = languageMiddleware;
//# sourceMappingURL=languageMiddleware.js.map