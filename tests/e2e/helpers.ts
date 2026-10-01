import { expect, type Page, type TestInfo } from '@playwright/test';

export const DEVICE = '/toestellen/intergas-kombi-kompakt-hre-24-18-a';

/** Screenshot + harde layoutcontroles uit de brief (geen horizontale scroll, niets buiten viewport). */
export async function shoot(page: Page, testInfo: TestInfo, name: string) {
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders: string[] = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
        const cls = typeof el.className === 'string' ? el.className.slice(0, 40) : '';
        offenders.push(`${el.tagName.toLowerCase()}.${cls}`);
      }
    });
    return { scroll: document.documentElement.scrollWidth - vw, offenders: offenders.slice(0, 5) };
  });
  expect(overflow.scroll, `horizontale scroll op ${name}`).toBeLessThanOrEqual(0);
  expect(overflow.offenders, `elementen buiten viewport op ${name}`).toEqual([]);
  await page.screenshot({ path: `screenshots/${testInfo.project.name}/${name}.png`, fullPage: true });
}

export async function startTestDiagnosis(page: Page) {
  await page.goto(`${DEVICE}/storing`);
  await page.getByRole('radio', { name: 'Symptoom', exact: true }).click();
  await page.getByRole('radio', { name: /Testsymptoom/ }).click();
  await expect(page).toHaveURL(/\/diagnose\/[\w-]+$/);
  await expect(page.getByRole('heading', { name: /Testvraag/ })).toBeVisible();
}
