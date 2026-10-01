import { expect, test } from '@playwright/test';
import { DEVICE, shoot, startTestDiagnosis } from './helpers';

test('home', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welk toestel?' })).toBeVisible();
  await shoot(page, info, '01-home');
});

test('toestellen zoeken + geen resultaat', async ({ page }, info) => {
  await page.goto('/toestellen');
  await page.getByRole('searchbox').fill('hre 24');
  await expect(page.getByRole('link', { name: /Kombi Kompakt HRE 24\/18 A/ })).toBeVisible();
  await shoot(page, info, '02-toestellen');
  await page.getByRole('searchbox').fill('remeha');
  await expect(page.getByRole('heading', { name: 'Geen toestel gevonden' })).toBeVisible();
  await shoot(page, info, '03-geen-resultaat');
});

test('toestelpagina + niet gevonden', async ({ page }, info) => {
  await page.goto(DEVICE);
  await expect(page.getByRole('link', { name: /Storing oplossen/ })).toBeVisible();
  await shoot(page, info, '04-toestel');
  await page.goto('/toestellen/bestaat-niet');
  await expect(page.getByRole('heading', { name: 'Toestel niet gevonden' })).toBeVisible();
  await shoot(page, info, '05-toestel-niet-gevonden');
});

test('storing: foutcode, onbekende code, symptoom', async ({ page }, info) => {
  await page.goto(`${DEVICE}/storing`);
  await shoot(page, info, '06-storing-foutcode');
  await page.getByLabel('Foutcode op display').fill('x99');
  await page.getByRole('button', { name: 'Zoek' }).click();
  await expect(page.getByRole('heading', { name: /Onbekende foutcode “X99”/ })).toBeVisible();
  await shoot(page, info, '07-onbekende-foutcode');
  await page.getByLabel('Foutcode op display').fill('t01');
  await page.getByRole('button', { name: 'Zoek' }).click();
  await expect(page.getByRole('button', { name: 'Start diagnose' })).toBeVisible();
  await page.getByRole('radio', { name: 'Symptoom', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Symptoom', exact: true })).toHaveAttribute('aria-checked', 'true');
  await shoot(page, info, '08-storing-symptoom');
});

test('diagnose: vraag, meting, veiligheid, uitkomst, rapport', async ({ page }, info) => {
  await startTestDiagnosis(page);
  await expect(page.getByText('Stap 1')).toBeVisible();
  await shoot(page, info, '09-diagnose-vraag');

  // Ingeklapt: Bron opent pas na tik
  await page.getByText('Bron', { exact: true }).click();
  await shoot(page, info, '10-diagnose-bron-open');
  await page.getByText('Bron', { exact: true }).click();

  // Veiligheid: niet weg te tikken
  await page.getByRole('radio', { name: 'Test veiligheid' }).click();
  const stop = page.getByRole('dialog', { name: 'Installatie niet verder in bedrijf stellen' });
  await expect(stop).toBeVisible();
  await shoot(page, info, '11-veiligheidsstop');
  await page.keyboard.press('Escape');
  await expect(stop).toBeVisible();
  await expect(stop.getByRole('button', { name: 'Bevestigen' })).toBeDisabled();
  await stop.getByRole('checkbox').check();
  await stop.getByRole('button', { name: 'Bevestigen' }).click();
  await expect(stop).toBeHidden();

  // Instructie
  await expect(page.getByRole('heading', { name: /Testhandeling/ })).toBeVisible();
  await shoot(page, info, '12-instructie');
  await page.getByRole('button', { name: 'Gedaan' }).click();

  // Meting zonder bereik, met ongeldige waarde
  const input = page.getByLabel('Testgrootheid');
  await input.fill('-300');
  await expect(page.getByText(/Ongeldige waarde/)).toBeVisible();
  await shoot(page, info, '13-meting-ongeldig');
  await input.fill('61,5');
  await expect(page.getByText('Geen bereik bekend')).toBeVisible();
  await shoot(page, info, '14-meting-zonder-bereik');
  await page.getByRole('button', { name: 'Waarde vastleggen' }).click();

  // Uitkomst
  await expect(page.getByRole('heading', { name: 'Testoorzaak' })).toBeVisible();
  await expect(page.getByText('Nog niet beschikbaar')).toBeVisible();
  await shoot(page, info, '15-uitkomst');

  await page.getByRole('link', { name: 'Rapport maken' }).click();
  await expect(page.getByText('61,5 °C')).toBeVisible();
  await expect(page.getByText(/VEILIGHEIDSSTOP — Gaslekkage/)).toBeVisible();
  await shoot(page, info, '16-rapport');
});

test('meting met bereik + inhoud nog niet beschikbaar', async ({ page }, info) => {
  await startTestDiagnosis(page);
  await page.getByRole('radio', { name: 'Ja' }).click();
  await page.getByLabel('Testgrootheid').fill('1.4');
  await expect(page.getByText('Binnen bereik')).toBeVisible();
  await shoot(page, info, '17-meting-binnen-bereik');
  await page.getByLabel('Testgrootheid').fill('2,6');
  await expect(page.getByText('Buiten bereik')).toBeVisible();
  await page.getByRole('button', { name: 'Niet gemeten' }).click();
  await expect(page.getByRole('heading', { name: 'Nog niet beschikbaar' })).toBeVisible();
  await shoot(page, info, '18-nog-niet-beschikbaar');
});

test('stoppen + hervatten + sessie niet gevonden', async ({ page }, info) => {
  await startTestDiagnosis(page);
  await page.getByRole('radio', { name: 'Ja' }).click();
  await expect(page.getByText('Stap 2')).toBeVisible();

  // Hervatten vanaf home
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Diagnose hervatten/ })).toBeVisible();
  await shoot(page, info, '19-home-hervatten');
  await page.getByRole('link', { name: /Diagnose hervatten/ }).click();
  await expect(page.getByText('Stap 2')).toBeVisible();

  // Terug = vorige beslissing
  await page.getByRole('button', { name: 'Vorige stap' }).click();
  await expect(page.getByText('Stap 1')).toBeVisible();

  // Stop → sheet
  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(page.getByRole('dialog', { name: 'Diagnose stoppen?' })).toBeVisible();
  await shoot(page, info, '20-stop-sheet');
  await page.getByRole('button', { name: 'Stoppen en rapport maken' }).click();
  await expect(page).toHaveURL(/\/rapport$/);
  await expect(page.getByText(/Geen conclusie: de diagnose is gestopt/)).toBeVisible();

  await page.goto('/diagnose/bestaat-niet');
  await expect(page.getByRole('heading', { name: 'Sessie niet gevonden' })).toBeVisible();
  await shoot(page, info, '21-sessie-niet-gevonden');
});
