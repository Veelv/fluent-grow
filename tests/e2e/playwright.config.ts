import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './specs',
  timeout: 60_000,
  retries: 0,
  reporter: 'list',
  use: { trace: 'off' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ],
  webServer: {
    command: 'npx vite --port 5176',
    url: 'http://localhost:5176/src/main.ts',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
})
