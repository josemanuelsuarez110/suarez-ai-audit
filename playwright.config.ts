import {
  defineConfig,
  devices,
} from '@playwright/test'

import dotenv from 'dotenv'

dotenv.config({
  path: '.env.e2e',
})

const baseURL =
  process.env.E2E_BASE_URL ??
  'http://127.0.0.1:5173'

export default defineConfig({
  testDir: './e2e',

  timeout: 30_000,

  expect: {
    timeout: 8_000,
  },

  fullyParallel: false,

  workers: 1,

  retries:
    process.env.CI ? 2 : 0,

  forbidOnly:
    Boolean(process.env.CI),

  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
      },
    ],
  ],

  use: {
    baseURL,

    trace:
      'on-first-retry',

    screenshot:
      'only-on-failure',

    video:
      'retain-on-failure',

  },

  projects: [
    {
      name: 'setup',
      testMatch:
        /auth\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: {
        ...devices[
          'Desktop Chrome'
        ],

        storageState:
          'e2e/.auth/admin.json',
      },

      dependencies: [
        'setup',
      ],

      testIgnore:
        /auth\.setup\.ts/,
    },
  ],

  webServer: {
    command:
      'npm run dev -- --host 127.0.0.1',

    url: baseURL,

    reuseExistingServer:
      !process.env.CI,

    timeout:
      120_000,

    stdout: 'ignore',
    stderr: 'pipe',
  },
})
