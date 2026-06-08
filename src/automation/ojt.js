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

  // fill popup activity log
  await frame.locator('textarea[appmagic-control="FailedInput_1textarea"]').fill(logText);
  await page.waitForTimeout(1000);

  // select AM/PM
  await frame.getByRole('button', { name: /\. AM/ }).click();
  await page.waitForTimeout(500);
  await frame.getByRole('option', { name: 'AM' }).click();
  await page.waitForTimeout(500);

  // select hour
  await frame.getByRole('button', { name: /\. 12/ }).click();
  await page.waitForTimeout(500);
  await frame.getByRole('option', { name: '5' }).click();
  await page.waitForTimeout(500);

  // select minutes
  await frame.getByRole('button', { name: /\. 00/ }).click();
  await page.waitForTimeout(500);
  await frame.getByRole('option', { name: '00' }).click();
  await page.waitForTimeout(500);

  // submit
  await frame.getByRole('button', { name: 'Submit', exact: true }).click();
  await page.waitForTimeout(3000);

  const success = await verifyTimeOut(frame);

  const screenshotPath = `screenshots/timeout-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved: ${screenshotPath}`);

  await browser.close();
  return { success, screenshotPath };
}

async function verifyTimeOut(frame) {
  try {
    return await frame
      .getByText('No Active Session')
      .isVisible({ timeout: 10000 });
  } catch {
    return false;
  }
}

module.exports = { login, timeIn, timeOut, verifySuccess, verifyTimeOut };