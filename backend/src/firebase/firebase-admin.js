"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
if (!(0, app_1.getApps)().length) {
    if (projectId && clientEmail && privateKey) {
        (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    }
    else if (projectId) {
        console.log(`Initializing Firebase Admin with projectId: ${projectId} for token verification.`);
        (0, app_1.initializeApp)({ projectId });
    }
    else {
        console.warn("Firebase Admin environment variables missing. Using default initialization (may fail if not deployed with ADC).");
        (0, app_1.initializeApp)();
    }
}
exports.adminAuth = (0, auth_1.getAuth)();
//# sourceMappingURL=firebase-admin.js.map