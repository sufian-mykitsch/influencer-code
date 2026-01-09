import { test, expect } from '@playwright/test';

test('create new user and fetch product titles', async ({ page }) => {
  const base = 'https://rahulshettyacademy.com/client';
  const twoDigits = String(Math.floor(Math.random() * 90) + 10); // generates 10-99
  const email = `testuser+${twoDigits}@example.com`;
  const password = 'Password123!';

  await page.goto(`${base}/#/auth/register`);

  await page.fill('#firstName', 'Test');
  await page.fill('#lastName', 'User');
  await page.fill('#userEmail', email);
  await page.fill('#userMobile', '1234567890');

  await page.selectOption('select[formcontrolname="occupation"]', { label: 'Student' }).catch(() => {});

  await page.locator('input[type="radio"][formcontrolname="gender"][value="Male"]').first().check().catch(() => {});

  await page.fill('#userPassword', password);
  await page.fill('#confirmPassword', password);

  await page.check('input[formcontrolname="required"]').catch(() => {});

  await Promise.all([
    page.locator('#login').first().click(),
  ]);

  // Ensure we're on the login page, then perform login
  await page.goto(`${base}/#/auth/login`);

  await page.fill('input[formcontrolname="userEmail"], #userEmail, input[placeholder="email@example.com"], input[placeholder="Email"]', email);
  await page.fill('input[formcontrolname="userPassword"], #userPassword, input[placeholder="Passsword"], input[type="password"]', password);

  await Promise.all([
    page.locator('#login').click()]);

  const productSelector = '.card-body b, .card-title, .product-title, .inventory_item_name, .product-name';
  await page.waitForSelector(productSelector, { timeout: 10000 });

  const Title1 = await page.locator(productSelector).allTextContents();
  console.log('Fetched product titles using locator:', Title1);
  const titles = await page.$$eval(productSelector, els => els.map(e => e.textContent.trim()).filter(Boolean));

  console.log('Product titles:', titles);
  expect(titles.length).toBeGreaterThan(0);
});
