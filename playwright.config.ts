import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90000,
  retries: 1,
  reporter: [['html', { open: 'never' }], ['line']],
  use: {
    baseURL: 'http://localhost:3002',
    // Headless false so we can see what's happening for debugging
    headless: false,
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Grant microphone + audio permissions to unblock Web Speech API
    permissions: ['microphone'],
    // Chrome args to allow web speech in headless/headful
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--use-file-for-fake-audio-capture=tests/assets/hello_mentor.wav',
        '--allow-file-access-from-files',
        '--disable-web-security',
        '--autoplay-policy=no-user-gesture-required',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
