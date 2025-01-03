import { Firestore } from '@google-cloud/firestore';
import { ApifyClient } from 'apify-client';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';


/**
 * Get recent linkedin cookies stored in GCP Firestore database
 *
 * @returns {Array<Cookie>} An array of cookie objects, where each object has properties like `name`, `value`, `domain`, `path`, `expires`, and `secure`.
 */
export const getLinkedinCookies = async () => {

    try {
        //get cookies
        const firestore = new Firestore({
            keyFilename: './sb-news-generator-91bfe097ca12.json',
            ignoreUndefinedProperties: true
        });
        const firestoreLICookies = await firestore.doc('cookies/linkedin-cookies');
        const cookies = (await firestoreLICookies.get()).data().cookies;
        return { success: true, cookies };
    } catch (error) {
        return { success: false, error, errorMessage: 'There was trouble receiving authentication cookies' }
    }

}

/**
 * scarpes linkedin post using the Apify Linkedin Scarper
 *
 * @param {Array<Cookie>} cookies - An array of cookie object used for linkedin authentication to utilize apify scraper
 * @param {number} totalPosts - total number of posts that you would like to scraped
 * @param {string} pageURL - url of company profile that we will be scrapping from
 * @returns {Array<Posts>} An array of scraped Linkedin posts objects
 */
export const scrapeLinkedinPosts = async (cookies, totalPosts, pageURL) => {
    try {
        // Client initialization with the API token for Apify LinkedIn Scraper
        const client = new ApifyClient({
            token: process.env.APIFY_API_KEY,
        });

        // Actor Input needed for things like authorization and specifications on what exactly to pull (company name, start/end, page, etc)
        const input = {
            "cookie": cookies,
            "deepScrape": true,
            "urls": [pageURL],
            "maxDelay": 10,
            "minDelay": 2,
            "strictMode": false,
            "proxy": {
                "useApifyProxy": true,
                "apifyProxyCountry": "US"
            },
            "limitPerSource": totalPosts,
        };
        // Run the Actor and wait for it to finish
        const run = await client.actor("kfiWbq3boy3dWKbiL").call(input);

        // Fetch Actor's results from the run's dataset (if any)
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        //return results
        return { success: true, items };
    } catch (error) {
        return { success: false, error };
        //res.status(500).json({ error: `There was an error pulling Linkedln posts: ${error.message}` });
    }


}

export const scrapeLinkedinPostsRawData = async (cookies, totalPosts, pageURL) => {
    try {
        // Client initialization with the API token for Apify LinkedIn Scraper
        const client = new ApifyClient({
            token: process.env.APIFY_API_KEY,
        });

        // Actor Input needed for things like authorization and specifications on what exactly to pull (company name, start/end, page, etc)
        const input = {
            "cookie": cookies,
            "deepScrape": true,
            "rawData": true,
            "urls": [pageURL],
            "maxDelay": 10,
            "minDelay": 2,
            "strictMode": false,
            "proxy": {
                "useApifyProxy": true,
                "apifyProxyCountry": "US"
            },
            "limitPerSource": totalPosts,
        };
        // Run the Actor and wait for it to finish
        const run = await client.actor("kfiWbq3boy3dWKbiL").call(input);

        // Fetch Actor's results from the run's dataset (if any)
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        //return results
        return { success: true, items };
    } catch (error) {
        return { success: false, error };
        //res.status(500).json({ error: `There was an error pulling Linkedln posts: ${error.message}` });
    }


}

/**
 * Generate's text (article title & body) with the help of the Google Gemini API
 *
 * @param {string} articleReference - text that will be used as a backdrop to generate a title & full length article body
 * @returns {{title: string, body: string}} An object containing the title and body generated from Gemini
 */
export const generateArticleText = async (articleReference) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        //Example to provide gemeni to assure that the generates article body is in the structure of a standard article.
        const structureExample = `Starting a blog was one of the most rewarding things I’ve done in my career. As someone who loves writing and connecting with readers, having an outlet to share my thoughts while potentially helping others has been an incredible experience.
        When I first began blogging a few years ago, I really had no idea what I was doing. I would just sit down at my computer whenever inspiration struck and write whatever came to mind. Sometimes I would publish posts without even proofreading them because I was so eager to get my ideas out there.
        Looking back now, those early posts were pretty rough. It’s almost cringe-worthy to read some of my early writing. But we all have to start somewhere, right? Even though I made plenty of mistakes (which I’ll detail later in this post), blogging has enabled me to find my voice, create helpful content, and connect with readers from all walks of life.
        If you’re thinking about starting a blog but feel intimidated or don’t know where to begin, I want this post to encourage you. You don’t have to have everything figured out on day one. I certainly didn’t! Consider this your kick in the pants to just take that first step and start writing.
        And to help you avoid some of the early pitfalls I encountered, I’ll take you through a step-by-step guide to learn how to write a great post, drawing from my own experience as well as expert insights from top bloggers. Get ready to take notes!`;

        //Actual prompt we will be giving to AI to generate the articles body
        const bodyPrompt = `write a long-style blog post in html paragraph elements with at least 5 paragraph based on the following information:  \n ${articleReference} \n Here is a example of what I want the structure to look like: ${structureExample}`;

        //generate article body
        const postBody = await model.generateContent(bodyPrompt);

        const regex = /<p>(.*?)<\/p>/g;
        const matches = postBody.response.text().matchAll(regex);
        let pElementsString = '';

        for (const match of matches) {
            pElementsString = pElementsString + `<p>${match[1]}</p>\n\n`;
        }

        //Prompt for AI to generate the articles title
        const titlePrompt = `Create one short blog title unbolded based on the following information: \n ${articleReference}`

        //generate article body
        const postTitle = await model.generateContent(titlePrompt);

        return { success: true, title: postTitle.response.text(), body: pElementsString };
    } catch (error) {
        console.log(error);
        return { success: false, error, errorMessage: `There was an issue converting the orginial into a article: ${error.message}` };
    }


}

export const generateUpdateText = async (reference) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        //Actual prompt we will be giving to AI to generate the articles body
        const prompt = `Generate a paragraph, short or long, with no hashtags that I can post to social media. The generate paragraph should be wrapped in html paragraph element text. For any links generated in your text, please wrap them in text based html anchor elements (<a></a>). Please do no include any hashtags. Base your post on the following text:  \n ${reference}`;

        //generate article body
        const post = await model.generateContent(prompt);

        const titlePrompt = `Create one short blog title unbolded based on the following information: \n ${reference}`

        //generate article body
        const postTitle = await model.generateContent(titlePrompt);

        return { success: true, title: postTitle.response.text(), body: post.response.text() };
    } catch (error) {
        console.log(error);
        return { success: false, error, errorMessage: `There was an issue converting the orginial into a article: ${error.message}` };
    }


}

export const getChannelType = async (authKey, channelID) => {
    try {
        //Authorization Header
        const headers = {
            Authorization: `Basic ${authKey}`,

        }
        const baseUrl = `https://app.staffbase.com/api/channels/${channelID}`;
        const response = await axios.get(baseUrl, { headers });
        return response.data.contentType;
    }catch(error){
        console.log(error);
    }
}

/**
 * Post Staffbase Article to specified channel
 *
 * @param {string} channelID - channel to post article
 * @param {string} articleTitle - title for article
 * @param {string} articleBody - body for article
 * @param {string} articleImage - url to image for article
 * 
 */
export const createStaffbaseArticle = async (authKey, channelID, articleTitle, articelBody, articleImage, delay = true) => {

    try {
        //Authorization Header
        const headers = {
            Authorization: `Basic ${authKey}`,

        }
        const baseUrl = `https://app.staffbase.com/api/channels/${channelID}/posts`;
        const body = {
            contents: {
                en_US: articleImage !== '' ? {
                    content: articelBody,
                    image: articleImage,
                    title: articleTitle
                } : {
                    content: articelBody,
                    title: articleTitle
                }
            }
        };

        const delayTimes = [
            10000, // 10 seconds
            12000, // 12 seconds
            13000, // 12 seconds
            15000, // 15 seconds
            17000, // 17 seconds
            20000, // 20 seconds
            26000, // 26 seconds
            30000,  // 30 seconds
            40000,  // 40 seconds
            44000,  // 44 seconds
            50000,  // 50 seconds
            60000,  // 60 seconds
            63000,  // 63 seconds
            70000,  // 70 seconds
            77000,  // 77 seconds
            80000,  // 80 seconds
            88000,  // 88 seconds
            90000,  // 90 seconds
            96000,  // 96 seconds
            96000,  // 97 seconds
        ];

        function getRandomIndex(array) {
            const randomIndex = Math.floor(Math.random() * array.length);
            return delayTimes[randomIndex];
        }
        const delayBy = getRandomIndex(delayTimes);
        if (delay) {
            console.log(`delay by ${delayBy} seconds`);
            // Introduce delay before making the request
            await new Promise(resolve => setTimeout(resolve, delayBy)); // Delay of 2 seconds
        }


        const response = await axios.post(baseUrl, body, { headers });
        console.log(`Article posted successfully after ${delayBy} seconds!`);
        return { success: true };
    } catch (error) {
        return { success: false, error, errorMessage: `Error posting article: ${error}` };
    }


}

