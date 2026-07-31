"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateError = translateError;
const AIProvider_1 = require("../config/AIProvider");
/**
 * Translates backend error messages into the requested locale using OpenRouter.
 * @param errorMessage The English error message.
 * @param locale The target ISO language code (e.g., 'hi', 'en', 'mr').
 * @returns The translated error message, or original if failed.
 */
async function translateError(errorMessage, locale) {
    if (!locale || locale === 'en' || !errorMessage)
        return errorMessage;
    try {
        const response = await (0, AIProvider_1.generateResponse)([
            { role: 'system', content: `You are an expert technical translator. Translate the following backend error message into the ISO language code: ${locale}. Return ONLY the translated string, no quotes, no markdown, no conversational text.` },
            { role: 'user', content: errorMessage }
        ], { temperature: 0.1 });
        // Ensure we don't return the fallback generic message if it completely fails
        if (response.model === 'none' || !response.text || response.text.length > 200) {
            return errorMessage;
        }
        return response.text.trim();
    }
    catch (err) {
        console.error('[ErrorTranslator] Failed to translate error:', err);
        return errorMessage;
    }
}
//# sourceMappingURL=errorTranslator.js.map