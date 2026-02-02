import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'src/tests'),
  timeout: 180_000,
  retries: 0,

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/report.json' }]
  ],
  
  projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      }
    ],

  use: {
    headless: true,
    viewport: { width: 1366, height: 768 },
    actionTimeout: 120_000,
    navigationTimeout: 120_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
});


//C:\playwright_project\Playwright\playwright-report
//C:\playwright_project\Playwright\src\routes