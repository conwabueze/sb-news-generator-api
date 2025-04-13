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

/**
 * Asynchronously installs a predefined list of custom widgets into a Staffbase environment
 * by automating browser actions using Puppeteer. It logs into the Staffbase Studio,
 * navigates to the custom widgets settings, and adds each widget URL.
 *
 * @async
 * @param {string} email - The email address used to log in to the Staffbase Studio.
 * @param {string} password - The password used to log in to the Staffbase Studio.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if all widgets were
 * successfully added, and `false` if any error occurred during the process.
 */
export const customWidgetsInstallation = async (email, password) => {
    // An object mapping a user-friendly name for each custom widget to its installation URL.
    const customWidgetList = {
        "stock-ticker": "https://eirastaffbase.github.io/stock-ticker/dist/staffbase.stock-ticker.js",
        "job-postings": "https://eirastaffbase.github.io/job-postings/dist/staffbase.job-postings.js",
        "weather-time": "https://eirastaffbase.github.io/weather-time/dist/eira.weather-time.js",
        "count-up": "https://maximizeit.github.io/sb-custom-widget-countup/dist/maximize-it.custom-widget-countup.js",
        "count-down": "https://maximizeit.github.io/sb-custom-widget-countdown/dist/maximize-it.custom-widget-countdown.js"
    }

    let browser = undefined; // Initialize a variable to hold the Puppeteer browser instance.
    try {
        // Launch a new instance of Chrome using Puppeteer.
        // 'headless: true' runs the browser in the background without a GUI.
        // 'defaultViewport: null' sets the viewport to the full screen size.
        //browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--no-sandbox'] });
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox'],
          });

        const page = await browser.newPage(); // Create a new page within the browser.

        // --- Step 1: Sign in to Staffbase Studio ---
        await page.goto('https://app.staffbase.com/studio', {
            waitUntil: 'networkidle0', // Wait until there are no more network connections for at least 500 ms (considered stable).
            timeout: 60000, // Set a timeout of 60 seconds for the page to load.
        });
        await page.waitForSelector('input[name="identifier"]'); // Wait for the email/identifier input field to be present.
        await page.click('input[name="identifier"]'); // Click on the email/identifier input field to focus it.
        await page.type('input[name="identifier"]', email); // Type the provided email address into the input field.
        await page.waitForSelector('input[name="secret"]'); // Wait for the password input field to be present.
        await page.click('input[name="secret"]'); // Click on the password input field to focus it.
        await page.type('input[name="secret"]', password); // Type the provided password into the input field.
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.waitForSelector('button[type="submit"]'); // Wait for the submit button to be present.
        await page.click('button[type="submit"]'); // Click the submit button to log in.

        // --- Step 2: Navigate to Custom Widgets Settings ---
        await page.goto('https://app.staffbase.com/admin/settings/widgets'); // Navigate directly to the custom widgets settings page.

        // --- Step 3: Add each custom widget from the list ---
        const widgetOptions = Object.keys(customWidgetList); // Get an array of the widget names (keys from customWidgetList).
        for(const customWidget of widgetOptions){
            // Wait for the input field where the widget URL is entered.
            await page.waitForSelector('input[placeholder="Enter the URL, e.g. https://staffba.se/customwidget.js"]');
            // Type the URL of the current custom widget into the input field.
            await page.type('input[placeholder="Enter the URL, e.g. https://staffba.se/customwidget.js"]', customWidgetList[customWidget]);
            // Wait for and click the button that saves the widget.
            await page.waitForSelector('.eve1box0');
            await page.click('.eve1box0');
            // Introduce a short delay to allow the widget to be added and the UI to update.
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Reload the page to ensure the widget is properly added and the input field is reset for the next widget.
            await page.reload();
        }

        // --- Step 4: Close the browser ---
        await browser.close(); // Close the Puppeteer browser instance.
        return 'Custom widgets have been succeessfully added'; // Return success message

    } catch (error) {
        // --- Error Handling ---
        // If any error occurred during the process, ensure the browser is closed if it was launched.
        if(browser)
            await browser.close();
        console.log(error);
        return "ERROR: Custom widgets were unsucceessfully added"; // Return false to indicate that an error occurred.
    }
}