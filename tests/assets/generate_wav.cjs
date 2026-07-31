/**
 * Script to generate a minimal silent WAV file for Playwright fake audio capture.
 * Run: node tests/assets/generate_wav.cjs
 */
const fs = require('fs');
const path = require('path');

// 1 second of silence at 16kHz mono 16-bit PCM
const sampleRate = 16000;
const numChannels = 1;
const bitsPerSample = 16;
const duration = 2; // seconds
const numSamples = sampleRate * duration;
const dataSize = numSamples * numChannels * (bitsPerSample / 8);

const buffer = Buffer.alloc(44 + dataSize);

// RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // chunk size
buffer.writeUInt16LE(1, 20);  // PCM
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // byte rate
buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // block align
buffer.writeUInt16LE(bitsPerSample, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);
// data is zeroed = silence

const outPath = path.join(__dirname, 'hello_mentor.wav');
fs.writeFileSync(outPath, buffer);
console.log('Generated:', outPath, buffer.length, 'bytes');
