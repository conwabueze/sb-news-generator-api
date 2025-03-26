import axios from 'axios';
import puppeteer from 'puppeteer';

// const postCustomWidget = async (sbAuthKey, widgetUrl) => {
//     const url = 'https://app.staffbase.com/api/branch/widgets';

//     const headers = {
//         'Authorization': `Basic ${sbAuthKey}`,
//         'Content-Type': 'application/json;charset=utf-8'
//     };

//     const payload = {
//         "url": "https://eirastaffbase.github.io/stock-ticker/dist/staffbase.stock-ticker.js",
//         "elements": [
//             "stock-ticker"
//         ],
//         "attributes": [
//             "symbol",
//             "weeks"
//         ]
//     }

//     try {
//         const response = await axios.post(url, payload, { headers });
//         return { success: true, data: response.data }
//     } catch (error) {
//         return { success: false, data: error }
//     }

// }

export const customWidgetsInstallation = async (email, password) => {

    const customWidgetList = {
        "stock-ticker": "https://eirastaffbase.github.io/stock-ticker/dist/staffbase.stock-ticker.js",
        "job-postings": "https://eirastaffbase.github.io/job-postings/dist/staffbase.job-postings.js",
        "weather-time": "https://eirastaffbase.github.io/weather-time/dist/eira.weather-time.js",
        "count-up": "https://maximizeit.github.io/sb-custom-widget-countup/dist/maximize-it.custom-widget-countup.js",
        "count-down": "https://maximizeit.github.io/sb-custom-widget-countdown/dist/maximize-it.custom-widget-countdown.js"
    }

    // const customWidgetNames = Object.keys(customWidgetList);
    //     const cwPost = await postCustomWidget(sbAuthKey, "");
    //     console.log(cwPost.data)
    // // for(const name of customWidgetNames){
    // //     const cwPost = await postCustomWidget(sbAuthKey, customWidgetList[name]);
    // //     console.log(cwPost.data)
    // // }
    let browser = undefined;
    try {
        let browser = await puppeteer.launch({ headless: true, defaultViewport: null }); // Set headless to false to see the browser
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
        await page.goto('https://app.staffbase.com/admin/settings/widgets');
        const widgetOptions = Object.keys(customWidgetList);
        for(const customWidget of widgetOptions){
            await page.waitForSelector('input[placeholder="Enter the URL, e.g. https://staffba.se/customwidget.js"]');
            await page.type('input[placeholder="Enter the URL, e.g. https://staffba.se/customwidget.js"]', customWidgetList[customWidget]);
            await page.waitForSelector('.eve1box0');
            await page.click('.eve1box0');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.reload();
        }
       
        await browser.close();
        return true;
    } catch (error) {
        if(browser !== undefined)
            await browser.close();
        return false;
    }
}