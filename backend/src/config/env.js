"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = exports.validateEnv = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
const validateEnv = () => {
    const requiredKeys = [
        'OPENROUTER_API_KEY',
    ];
    const missingKeys = [];
    for (const key of requiredKeys) {
        if (!process.env[key]) {
            missingKeys.push(key);
        }
    }
    if (missingKeys.length > 0) {
        logger_1.mcpLogger.error('System', `Missing required environment variables: ${missingKeys.join(', ')}`);
        logger_1.mcpLogger.warn('System', 'Please add the missing keys to your .env file. The application will continue to run, but some services will fail.');
    }
    else {
        logger_1.mcpLogger.info('System', 'All required environment variables are present.');
    }
};
exports.validateEnv = validateEnv;
exports.ENV = {
    get PORT() { return process.env.PORT || '3000'; },
    get FRONTEND_URL() { return process.env.FRONTEND_URL || 'http://localhost:5173'; },
    get OPENROUTER_API_KEY() { return process.env.OPENROUTER_API_KEY || ''; },
    get AI_MODEL_PRIMARY() { return process.env.AI_MODEL_PRIMARY || 'google/gemma-4-26b-a4b-it:free'; },
    get AI_MODEL_SECONDARY() { return process.env.AI_MODEL_SECONDARY || 'deepseek/deepseek-r1-distill-llama-70b:free'; },
    get TAVILY_API_KEY() { return process.env.TAVILY_API_KEY || ''; },
    get FIREBASE_PROJECT_ID() { return process.env.FIREBASE_PROJECT_ID || ''; },
    get FIREBASE_CLIENT_EMAIL() { return process.env.FIREBASE_CLIENT_EMAIL || ''; },
    get FIREBASE_PRIVATE_KEY() { return process.env.FIREBASE_PRIVATE_KEY || ''; },
    get GITHUB_TOKEN() { return process.env.GITHUB_TOKEN || ''; },
    get SERPER_API_KEY() { return process.env.SERPER_API_KEY || ''; },
};
//# sourceMappingURL=env.js.map