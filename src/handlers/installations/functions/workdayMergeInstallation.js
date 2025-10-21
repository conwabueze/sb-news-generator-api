import puppeteer from 'puppeteer';

export const workdayMergeInstallation = async (email, password, userStudioIdentifier) => {
    let browser = undefined;
    try {
        //browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--no-sandbox']  }); // Set headless to false to see the browser
        browser = await puppeteer.launch({
            headless: 'new',
            //headless: false,
            args: ['--no-sandbox'],
            // defaultViewport: {
            //     width: 1920,
            //     height: 1080
            // }
        });
        const page = await browser.newPage();

        //sign in to studio
        await page.goto('https://app.staffbase.com/studio', {
            waitUntil: 'networkidle0', // or 'load'
            timeout: 60000, // 60 seconds
        });
        // await page.waitForSelector('input[name="identifier"]');
        // await page.click('input[name="identifier"]');
        // await page.type('input[name="identifier"]', email);
        // await page.waitForSelector('input[name="secret"]');
        // await page.click('input[name="secret"]');
        // await page.type('input[name="secret"]', password);
        await page.waitForSelector('button[data-view-link="signin"]'); //wait for sign-in button
        await page.click('button[data-view-link="signin"]'); //click sign in button
        await page.waitForSelector('input[name="identifier"]'); // Wait for the email/identifier input field to be present.
        await page.click('input[name="identifier"]'); // Click on the email/identifier input field to focus it.
        await page.type('input[name="identifier"]', email); // Type the provided email address into the input field.
        await page.waitForSelector('input[name="secret"]'); // Wait for the password input field to be present.
        await page.click('input[name="secret"]'); // Click on the password input field to focus it.
        await page.type('input[name="secret"]', password); // Type the provided password into the input field.
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.waitForSelector('button[type="submit"]');
        await page.click('button[type="submit"]');

        //Select Workday HR Option
        await page.goto('https://app.staffbase.com/studio/settings/extensions/hr-integrations');
        await page.waitForSelector('button[data-testid="merge-dev-extensions-card__add-btn"]');

        // if(!addIntegrationBtn){
        //     await browser.close();
        //     return 'ERROR: There may have been a issue signing in. Please double check your creds. If they are correct, please try 1-2 more times. If issue persist please reach out to mager of this script.';
        // }

        await page.click('button[data-testid="merge-dev-extensions-card__add-btn"]');
        await page.waitForSelector('img[alt="Workday"]');
        await page.click('img[alt="Workday"]');
        await page.waitForSelector('button.ds-modal__button--accept');
        await page.click('button.ds-modal__button--accept');
        await new Promise(resolve => setTimeout(resolve, 1000));

        //Click user identifier Staffbase Studio Option
        await page.waitForSelector('.ds-single-select__trigger');
        await page.click('.ds-single-select__trigger');

        //Look for desire Identifier and click next
        let selector = '.ds-single-select__option-label';
        let targetInnerHTML = userStudioIdentifier;
        let searchForElement = await page.evaluate((selector, targetText) => {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (element.innerHTML.toLowerCase().trim() === targetText.toLowerCase().trim()) {
                    element.click();
                    return true; // Indicate that the element was found and clicked
                }
            }
            return false; // Indicate that no matching element was found
        }, selector, targetInnerHTML);

        if (!searchForElement) {
            await browser.close();
            return 'ERROR: Could on find user identifier. Please make sure you are selecting a identifier that exist';
        }

        const classSelector = '.ds-text-input__base-input';
        await page.waitForSelector(classSelector);
        await page.type(classSelector, 'Workday Integration');

        await page.waitForSelector('button.ds-modal__button--accept');
        await page.click('button.ds-modal__button--accept');
        await new Promise(resolve => setTimeout(resolve, 5000));

        //Get Merge iFrame
        const iframeElement = await page.$('#merge-link-iframe');
        if (!iframeElement) {
            console.log('Error getting iFrame');
        }
        //Get content from iFrame
        const iframeContentFrame = await iframeElement.contentFrame();
        if (!iframeContentFrame) {
            console.log('Error getting content iFrame ')
        }

        //Click on 'Use my Workday credentials and also provide OAuth credentials.' button
        selector = '.text-base';
        targetInnerHTML = "Use my Workday credentials and also provide OAuth credentials.";
        await iframeContentFrame.evaluate((selector, targetText) => {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (element.innerHTML.trim() === targetText.trim()) {
                    element.click();
                    return true; // Indicate that the element was found and clicked
                }
            }
            return false; // Indicate that no matching element was found
        }, selector, targetInnerHTML);


        await new Promise(resolve => setTimeout(resolve, 5000));

        //click I am an admin button
        selector = '#custom-button';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);

        await new Promise(resolve => setTimeout(resolve, 3000));

        //click next
        selector = '#requested-data-custom-button';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);

        await new Promise(resolve => setTimeout(resolve, 3000));

        //add web services endpoint URL
        selector = 'input[placeholder="URL"]';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);
        await iframeContentFrame.type(selector, process.env.WORKDAY_URL.replace(/'/g, ''));

        //click next 
        selector = '#custom-button';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);

        await new Promise(resolve => setTimeout(resolve, 3000));

        //add Enter the credentials for the ISU
        selector = 'input[placeholder="Username"]';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);
        await iframeContentFrame.type(selector, process.env.WORKDAY_USERNAME.replace(/'/g, ''));
        selector = 'input[placeholder="Password"]';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);
        await iframeContentFrame.type(selector, process.env.WORKDAY_PASSWORD.replace(/'/g, ''));

        //click next 
        selector = '#custom-button';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);

        await new Promise(resolve => setTimeout(resolve, 3000));

        //add Enter your tenant name
        selector = 'input[placeholder="Enter value"]';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);
        await iframeContentFrame.type(selector, process.env.WORKDAY_TENANT_NAME.replace(/'/g, ''));

        //click next
        selector = '#custom-button';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);

        await new Promise(resolve => setTimeout(resolve, 3000));

        //add Enter your tenant name
        selector = 'input[placeholder="Client ID"]';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);
        await iframeContentFrame.type(selector, process.env.WORKDAY_CLIENT_ID.replace(/'/g, ''));
        selector = 'input[placeholder="Client secret"]';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);
        await iframeContentFrame.type(selector, process.env.WORKDAY_CLIENT_SECRET.replace(/'/g, ''));

        //click next
        selector = '#custom-button';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);

        await new Promise(resolve => setTimeout(resolve, 3000));

        //add Enter your refresh token and token URL
        selector = 'input[placeholder="Workday OAuth token URL"]';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);
        await iframeContentFrame.type(selector, process.env.WORKDAY_TOKEN_ENDPOINT.replace(/'/g, ''));
        selector = 'input[placeholder="Workday Refresh token"]';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);
        await iframeContentFrame.type(selector, process.env.WORKDAY_REFRESH_TOKEN.replace(/'/g, ''));

        //click next
        selector = '#custom-button';
        await iframeContentFrame.waitForSelector(selector);
        await iframeContentFrame.click(selector);

        await new Promise(resolve => setTimeout(resolve, 7000));

        //close browser
        await browser.close();
        return 'Workday Integration has been successfully added';


    } catch (error) {
        if (browser)
            await browser.close();
        console.log(error);
        return 'ERROR: There was a issue running the workday integration. Make sure you are entering in the correct creds. Run this script again and if issue keeps persisting please reachout to the manager of this script';
    }
}