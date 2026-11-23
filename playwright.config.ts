import { defineConfig, devices } from '@playwright/test'

const port = process.env.E2E_PORT || '3210'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL: `http://127.0.0.1:${port}`, channel: 'chromium' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ],
  webServer: {
    command: 'node tests/e2e-server.cjs',
    url: `http://127.0.0.1:${port}/movies`,
    reuseExistingServer: false,
    timeout: 30000
  }
})
