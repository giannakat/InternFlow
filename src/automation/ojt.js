const { chromium } = require('playwright');
const { ojtEmail, ojtPassword, ojtUrl } = require('../config');
const path = require('path');

const authFile = path.join(__dirname, '../../auth.json');

async function login(page) {
  await page.goto(ojtUrl);

  await page.waitForTimeout(3000);

  const needsLogin = await page.getByRole('textbox', { name: /email|phone/i }).isVisible().catch(() => false);

  if (!needsLogin) {
    console.log('Already logged in, skipping auth.');
    return;
  }

  console.log('Logging in...');
  await page.getByRole('textbox', { name: /email|phone/i }).fill(ojtEmail);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForTimeout(2000);
  await page.locator('#i0118').fill(ojtPassword);
  await page.locator('#i0118').press('Enter');
  await page.waitForTimeout(2000);

  const accountPicker = await page.locator(`[data-test-id="${ojtEmail}"]`).isVisible().catch(() => false);
  if (accountPicker) {
    await page.locator(`[data-test-id="${ojtEmail}"]`).click();
  }

  await page.waitForTimeout(5000);
}

async function timeIn() {
  const browser = await chromium.launch({ headless: false });

  const context = await browser.newContext({
    storageState: 'auth/session.json'
  });

  const page = await context.newPage();
  await page.goto(ojtUrl);
  await page.waitForTimeout(8000);

  const frame = page.frameLocator('iframe[name="fullscreen-app-host"]');
  await frame.getByRole('button', { name: 'Attendance', exact: true }).click();
  await page.waitForTimeout(3000);
  await frame.getByRole('button', { name: 'Time - In', exact: true }).click();
  await page.waitForTimeout(3000);
  await frame.getByRole('button', { name: 'YES', exact: true }).click();
  await page.waitForTimeout(3000);

  const success = await verifySuccess(frame);

  const screenshotPath = `screenshots/timein-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved: ${screenshotPath}`);  

  if (success) {
    console.log('Time In successful.');
  } else {
    console.log('Time In may have failed. Check manually.');
  }

  await browser.close();
  return { success, screenshotPath };
}

async function verifySuccess(frame) {
  const noSession = await frame.getByText('No Active Session').isVisible().catch(() => false);
  return !noSession;
}

async function timeOut(logText) {
  const browser = await chromium.launch({ headless: false });

  const context = await browser.newContext({
    storageState: 'auth/session.json'
  });

  const page = await context.newPage();
  await page.goto(ojtUrl);
  await page.waitForTimeout(8000);

  const frame = page.frameLocator('iframe[name="fullscreen-app-host"]');
  await frame.getByRole('button', { name: 'Attendance', exact: true }).click();
  await page.waitForTimeout(3000);

  // these selectors will be confirmed tomorrow during your actual shift
  await frame.getByRole('button', { name: 'Time - Out', exact: true }).click();
  await page.waitForTimeout(2000);
  await frame.getByRole('button', { name: 'YES', exact: true }).click();
  await page.waitForTimeout(3000);

  const success = await verifySuccess(frame);

  const screenshotPath = `screenshots/timeout-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved: ${screenshotPath}`);

  await browser.close();
  return { success, screenshotPath };
}

module.exports = { login, timeIn, timeOut, verifySuccess };