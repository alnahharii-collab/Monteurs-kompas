import { defineConfig } from '@playwright/test';

const widths = [
  { name: '360', width: 360, height: 780 },
  { name: '390', width: 390, height: 844 },
  { name: '430', width: 430, height: 932 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 },
];

const PORT = 3100;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'nl-NL',
    timezoneId: 'Europe/Amsterdam',
    contextOptions: { reducedMotion: 'reduce' },
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
  },
  projects: widths.map((w) => ({
    name: w.name,
    use: { viewport: { width: w.width, height: w.height }, hasTouch: w.width < 600, isMobile: w.width < 600 },
  })),
  webServer: {
    // Testfixtures alleen in deze build; een gewone `npm run build` laat ze weg.
    command: `NEXT_PUBLIC_TEST_FIXTURES=1 npm run build && npx next start -p ${PORT}`,
    port: PORT,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
  },
});
