const { chromium } = require('playwright');

(async () => {
  // Start browser
  const browser = await chromium.launch({
    headless: false,
  });

  // Create page
  const page = await browser.newPage();

  // Open your website
  await page.goto('https://www.facebook.com/', {
    waitUntil: 'domcontentloaded',
  });

  console.log('Page opened.');

  // Wait for page to load
  await page.waitForTimeout(5000);

  // Find the element containing "Log in"
  const loginElement = page
    .locator('div[role="none"]')
    .filter({ hasText: 'Log in' })
    .first();

  // Check whether the element exists
  if (await loginElement.count() === 0) {
    console.log('Log in element not found.');
    return;
  }

  console.log('Log in element found.');

  // Click every 2 seconds
  while (true) {
    try {
      // Make sure it is visible
      await loginElement.waitFor({ state: 'visible' });

      // Click
      await loginElement.click();

      console.log(
        `Clicked at ${new Date().toLocaleTimeString()}`
      );

      // Wait 2 seconds
      await page.waitForTimeout(2000);

    } catch (error) {
      console.log('Could not click element:', error.message);

      // Wait 2 seconds before trying again
      await page.waitForTimeout(2000);
    }
  }
})();