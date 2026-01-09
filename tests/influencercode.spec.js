import { test } from '@playwright/test';
import discountCodesData from '../json-files/all-discount-code-2.json';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const XLSX = require('xlsx');

test('validate all discount codes', async ({ page }) => {
  test.setTimeout(600000);

  await page.goto(
    'https://www.mykitsch.com/products/strengthening-rice-water-shampoo-conditioner-combo',
    { waitUntil: 'domcontentloaded' }
  );

  await page
    .locator('#shopify-section-sections--26278195396789__header')
    .getByRole('button', { name: '  PK' })
    .click();

  await page.getByRole('button', { name: '  United States (USD $)' }).click();

  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await page.getByRole('button', { name: /checkout/i }).click();

  await page.waitForSelector('input[name="reductions"]', { timeout: 30000 });

  const discountCodes = discountCodesData.discountCodes.flat();
  const results = [];

  const reductionsInput = page.locator('input[name="reductions"]').first();
  const removeDiscountBtn = page.locator('button[aria-label="Remove item"]');

  for (let i = 0; i < discountCodes.length; i++) {
    const code = discountCodes[i];

    if (page.isClosed()) break;

    try {
      if (await removeDiscountBtn.isVisible().catch(() => false)) {
        await removeDiscountBtn.click();
        await page.waitForTimeout(2000);
      }

      await reductionsInput.fill('');
      await reductionsInput.fill(code);
      await reductionsInput.press('Enter');

      await page.waitForTimeout(4000);

      let status = 'Invalid';
      let reason = 'Invalid or not applicable';

      const appliedCodeLocator = page.locator(
        `li:has(div[role="group"] span:text-is("${code}"))`
      );

      if (await appliedCodeLocator.first().isVisible().catch(() => false)) {
        status = 'Valid';
        reason = '';
      } else {
        const invalidMsg = page.locator(
          'text=/Enter a valid discount code or gift card/i'
        );

        const notApplicableMsg = page.locator(
          'text=/valid but not applicable/i'
        );

        if (await notApplicableMsg.isVisible().catch(() => false)) {
          reason = 'Valid but not applicable';
        }
      }

      results.push({
        Index: i + 1,
        Code: code,
        Status: status,
        Reason: reason,
        TestedAt: new Date().toISOString(),
      });

      console.log(
        `${status === 'Valid' ? '✓' : '✗'} ${i + 1}/${discountCodes.length} ${code} ${status}`
      );
    } catch (error) {
      results.push({
        Index: i + 1,
        Code: code,
        Status: 'Error',
        Reason: error.message,
        TestedAt: new Date().toISOString(),
      });
    }
  }

  const jsonPath = join(process.cwd(), 'json-files', 'discount-results-2.json');
  writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(results);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Discount Results');

  const excelPath = join(process.cwd(), 'json-files', 'discount-results-2.xlsx');
  XLSX.writeFile(workbook, excelPath);

  console.log('Finished testing all discount codes');
  console.log('JSON saved to', jsonPath);
  console.log('Excel saved to', excelPath);
});






// import { test, expect } from '@playwright/test';
// import discountCodesData from '../json-files/all-discount-codes.json';
// import { writeFileSync } from 'node:fs';
// import { join } from 'node:path';

// test('test', async ({ page }) => {
//   test.setTimeout(600000); // 10 minutes for all 651 codes
//   await page.goto('https://www.mykitsch.com/products/strengthening-rice-water-shampoo-conditioner-combo');
//   await page.getByRole('button', { name: /add/i }).first().click();
//   await page.getByRole('button', { name: 'add to cart' }).first().click();
//   await page.getByRole('button', { name: 'Checkout' , timeout: 30000}).click();
  
//   // Wait for the discount code input to appear using a more reliable selector
//   await page.waitForSelector('input[name="reductions"]', {
//     state: 'attached',
//     timeout: 30000,
//   });

//   // Get all discount codes from the JSON file
//   const discountCodes = discountCodesData.discountCodes;
//   const results = [];
  
//   // Loop through each discount code
//   for (let i = 0; i < discountCodes.length; i++) {
//     const code = discountCodes[i];
    
//     try {
//       // Check if page is still active, if not break the loop
//       if (page.isClosed()) {
//         console.log(`✗ Page closed at code ${i + 1}/${discountCodes.length}. Saving results...`);
//         break;
//       }

//       // Get the reductions input
//       const reductionsInput = page.locator('input[name="reductions"]').first();
      
//       // Clear the input with error handling
//       try {
//         await reductionsInput.clear();
//       } catch (clearError) {
//         console.log(`⚠ Could not clear input at code ${i + 1}, skipping...`);
//         continue;
//       }
      
//       // Fill in the discount code
//       await reductionsInput.fill(code);
      
//       // Wait a moment for the input to be processed
//       // await page.waitForTimeout(300);
      
//       // Click Apply Discount Code button
//       const applyButton = page.getByRole('button', { name: 'Apply Discount Code' }).first();
//       await applyButton.click();
      
//       // Wait for response (either error or success)
//       await page.waitForTimeout(2000);

//       // Check if error message appears (match the core text to handle variants)
//       const errorExists = await page.locator('text=/Enter a valid discount code or gift card/i').isVisible().catch(() => false);
//       // Some responses indicate the code is valid but not applicable (treat as invalid for our test)
//       const notApplicableExists = await page.locator('text=/valid but not applicable. Check discount terms./i').isVisible().catch(() => false);

//       if (errorExists || notApplicableExists) {
//         const reason = notApplicableExists ? 'NOT APPLICABLE (check terms)' : 'INVALID CODE';
//         console.log(`✗ Code ${i + 1}/${discountCodes.length}: ${code} - ${reason}`);
//         // Try to dismiss any visible message
//         try {
//           await page.locator('text=/Enter a valid discount code/i').first().click().catch(() => null);
//           await page.locator('text=/valid but not applicable/i').first().click().catch(() => null);
//           // await page.waitForTimeout(500);
//         } catch (e) {
//           // ignore dismissal errors
//         }
//         results.push({ index: i + 1, code, status: 'invalid', reason });
//       } else {
//         console.log(`✓ Code ${i + 1}/${discountCodes.length}: ${code} - VALID/APPLIED`);
//         results.push({ index: i + 1, code, status: 'valid' });
//         // If a code is applied successfully, wait 10 seconds before trying the next one
//         // await page.waitForTimeout(100);
//       }
//     } catch (error) {
//       console.log(`✗ Code ${i + 1}/${discountCodes.length}: ${code} - Error: ${error.message}`);
//       results.push({ index: i + 1, code, status: 'error', error: error.message });
//     }
//   }
  
//   console.log(`Finished testing all ${discountCodes.length} discount codes`);
//   // Write results to JSON file
//   try {
//     const outPath = join(process.cwd(), 'json-files', 'discount-results.json');
//     writeFileSync(outPath, JSON.stringify({ total: discountCodes.length, date: new Date().toISOString(), results }, null, 2));
//     console.log('Saved results to', outPath);
//   } catch (e) {
//     console.error('Failed to write results file:', e.message);
//   }
// });

