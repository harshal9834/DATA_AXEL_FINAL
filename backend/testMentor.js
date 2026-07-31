"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env'), override: true });
const conversationManager_1 = require("./src/services/voice/conversationManager");
async function test() {
    const socketId = 'test_socket_123';
    console.log('--- TEST 1: Simple Greeting ---');
    let res = await conversationManager_1.conversationManager.handleMessage(socketId, "Hi there!");
    console.log('Reply:', res.reply);
    console.log('ConfirmResearch:', res.confirmResearch);
    console.log('\n--- TEST 2: Complex Project Idea (Should trigger agents) ---');
    res = await conversationManager_1.conversationManager.handleMessage(socketId, "I want to build a real-time collaborative code editor with video chat. It needs authentication and scalable backend architecture.");
    console.log('Reply:', res.reply);
    console.log('ConfirmResearch:', res.confirmResearch);
    // Wait a bit to let the background workflow start
    await new Promise(r => setTimeout(r, 5000));
    console.log('\n--- TEST 3: Memory check ---');
    res = await conversationManager_1.conversationManager.handleMessage(socketId, "What was the project I just told you about?");
    console.log('Reply:', res.reply);
    console.log('\n--- TEST 4: Recommendations check ---');
    res = await conversationManager_1.conversationManager.handleMessage(socketId, "Do you have any suggestions for the tech stack based on our architecture?");
    console.log('Reply:', res.reply);
    process.exit(0);
}
test().catch(console.error);
//# sourceMappingURL=testMentor.js.map