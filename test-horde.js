const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log("Starting test on port 3001...");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to local port
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error));
  await page.goto("http://localhost:3001");
  console.log("Navigated");
  
  // Wait for loading to finish
  await page.waitForFunction(() => document.body.innerText.includes('Space'), { timeout: 15000 });
  
  // Find initial text
  const text = await page.evaluate(() => document.body.innerText);
  console.log("Initial state text snapshot:");
  console.log(text.substring(0, 200).replace(/\n/g, ' '));
  
  // Click to focus and press space character
  console.log("Pressing Space via window dispatch...");
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    }, 100);
  });
  await page.waitForTimeout(1000);
  
  // Press W to drive forward
  console.log("Pressing W...");
  await page.keyboard.down('w');
  await page.waitForTimeout(2000);
  await page.keyboard.up('w');
  
  // Get text again to see if Horde wave spawned
  const text2 = await page.evaluate(() => document.body.innerText);
  console.log("After driving text snapshot:");
  console.log(text2.substring(0, 200).replace(/\n/g, ' '));
  
  // Take screenshot
  await page.screenshot({ path: 'artifacts/horde-test.png' });
  console.log("Screenshot saved to artifacts/horde-test.png");
  
  await browser.close();
})();
