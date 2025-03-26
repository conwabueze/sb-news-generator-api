import puppeteer from 'puppeteer';

export const hrIntegrationInstallation = async (email, password) => {
    let browser = undefined;
    try {
        let browser = await puppeteer.launch({ headless: false, defaultViewport: null }); // Set headless to false to see the browser
        const page = await browser.newPage();

        //sign in to studio
        await page.goto('https://app.staffbase.com/studio', {
            waitUntil: 'networkidle0', // or 'load'
            timeout: 60000, // 60 seconds
        });
        await page.waitForSelector('input[name="identifier"]');
        await page.click('input[name="identifier"]');
        await page.type('input[name="identifier"]', email);
        await page.waitForSelector('input[name="secret"]');
        await page.click('input[name="secret"]');
        await page.type('input[name="secret"]', password);
        await page.waitForSelector('button[type="submit"]');
        await page.click('button[type="submit"]');

        //add custom widgets to env
        await page.goto('https://app.staffbase.com/studio/settings/extensions/hr-integrations');
        await page.waitForSelector('button[data-testid="merge-dev-extensions-card__add-btn"]');
        await page.click('button[data-testid="merge-dev-extensions-card__add-btn"]');
        await page.waitForSelector('img[alt="Workday"]');
        await page.click('img[alt="Workday"]');
        await page.waitForSelector('button.ds-modal__button--accept');
        await page.click('button.ds-modal__button--accept');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.waitForSelector('button.ds-modal__button--accept');
        await page.click('button.ds-modal__button--accept');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.waitForSelector('button.MuiButton-root');
        await page.click('button.MuiButton-root');
        const authenticationOptions = await page.$$('button.MuiButton-root');
        console.log(authenticationOptions);
        if(authenticationOptions.length === 0){
            return {success: false, error:'Error: Issue getting workday authenication options'};
        }
        await authenticationOptions[1].click();
        //ds-modal__button--accept
    } catch (error) {

    }
}