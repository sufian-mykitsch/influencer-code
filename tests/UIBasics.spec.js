const {test, expect} = require('@playwright/test');

test('First UIBasics test', async ({browser})=>{
//Playwright code goes here
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/")
    //get the title of the page
    console.log( await page.title());
    await expect(page).toHaveTitle("LoginPage Practise | Rahul Shetty Academy");
    await page.locator("#username").fill("sufian");  // type and fill both are same but the type method is deprecated.
    await page.locator("#password").fill("learning");
    await page.locator("#signInBtn").click();
});

test('Page fixture page browser ', async ({browser, page})=>{
    await page.goto("https://www.google.com/")
    //get the title of the page
    console.log(await page.title());
    await expect(page).toHaveTitle("Google");
});

test('check the error message while enetering the wrong data ', async ({page})=>{
     await page.goto("https://rahulshettyacademy.com/loginpagePractise/")
    //get the title of the page
    console.log( await page.title());
    await expect(page).toHaveTitle("LoginPage Practise | Rahul Shetty Academy");
    await page.locator("#username").fill("sufian");  // type and fill both are same but the type method is deprecated.
    await page.locator("#password").fill("learning");
    await page.locator("#signInBtn").click();
    await page.locator("[style*='block']").waitFor(); // attribute locator
    const errorMessage = await page.locator("[style*='block']").textContent();
    console.log(errorMessage);
});

test('check the error message while enetering the correct data ', async ({page})=>{
    const cardtitles = page.locator(".card-body a");
     await page.goto("https://rahulshettyacademy.com/loginpagePractise/")
    //get the title of the page
    console.log( await page.title());
    await expect(page).toHaveTitle("LoginPage Practise | Rahul Shetty Academy");
    await page.locator("#username").fill("rahulshettyacademy");  // type and fill both are same but the type method is deprecated.
    await page.locator("#password").fill("learning");
    await page.locator("#signInBtn").click();
    console.log(await cardtitles.first().textContent());
    console.log(await cardtitles.nth(3).textContent());
    const title  = await cardtitles.allTextContents();
    console.log(title);
});


test('@Child windows hadl', async ({browser})=>
 {
    const context = await browser.newContext();
    const page =  await context.newPage();
    const userName = page.locator('#username');
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
    const documentLink = page.locator("[href*='documents-request']");
 
    const [newPage]=await Promise.all(
   [
      context.waitForEvent('page'),//listen for any new page pending,rejected,fulfilled
      documentLink.click(),
   
   ])//new page is opened
   
 
   const  text = await newPage.locator(".red").textContent();
    const arrayText = text.split("@")
    const domain =  arrayText[1].split(" ")[0]
    //console.log(domain);
    await page.locator("#username").fill(domain);
    console.log(await page.locator("#username").inputValue());
 })