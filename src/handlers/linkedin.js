import { getLinkedinCookies, generateArticleText, createStaffbaseArticle, scrapeLinkedinPostsRawData, generateUpdateText, getChannelType, uploadMediaToStaffbase} from "../utils/reusableFunctions.js";
import axios from 'axios';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSBNewsChannel, publishSBNewsChannel} from "../utils/sbChannelCRUD.js";


const precheck = async (req, res, sbAuthKey, numPostsToScrape) => {
    const sbTest = await createStaffbaseArticle(sbAuthKey, req.body.channelID, 'SB NEWS GEN: Start Up (please Delete this Article)', 'Testing the NEWS API is working. Please ignore this', '');
    //POST a Test Staffbase Post to ensure everything is good before proceeding
    if (!sbTest.success) {
        switch (sbTest.error.status) {
            case 404:
                res.status(404).json({ error: 'INCORRECT_CHANNEL_ID', message: `There was an error when creating the Staffbase Article. Please make sure you are using the correct channelID` });
                return;
            case 403:
                res.status(403).json({ error: 'INCORRECT_SB_PERMISSION', message: `There was an error when creating the Staffbase Article. Please make sure you have access to this branch. Your token should have the permission level of Editorial and nothing lower or higher.` });
                return;
            case 401:
                res.status(401).json({ error: 'INCORRECT_SB_AUTH', message: `There was an error when creating the Staffbase Article. Please make sure you are using the correct Staffbase API Token. If yes, ensure that it is not disabled.` });
                return;
            default:
                console.log(sbTest.error);

        }
    }

    const cookies = await getLinkedinCookies();
    if (!cookies.success) {
        res.status(401).json({ error: 'NO_AUTH_COOKIES', message: 'There was an error in retrieving authentication cookies. Sorry for the inconvience. Please reach out to the SE Team to resolve this issue.' });
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: No AUTH Cookies, Please reach out to SE Team to resolve`, 'Please delete this article once no longer needed', '');
        return;
    }

    const gemTest = await generateArticleText('Write a short story about a robot who dreams of becoming a stand-up comedian. What challenges does it face? What kind of jokes does it tell?');
    if (!gemTest.success && [400, 403].includes(gemTest.error.status)) {
        res.status(403).json({ error: 'NO_GEMINI_AUTH', message: `There is an issue with the Gemini Authentication. Please reach out to the SE Team to resolve this issue.` })
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: No GEMINI AUTH, Please reach out to SE Team to resolve`, 'Please delete this article once no longer needed', '');
        console.error(gemTest.error);
        return;
    }

    //get linkedin posts
    const posts = await scrapeLinkedinPostsRawData(cookies.cookies, numPostsToScrape, req.body.pageURL);

    //check if posts are valid before proceeding. If not, return a 400 error
    if (!posts.success || posts.items.length === 0) {
        console.log(posts);
        res.status(400).json(!posts.success
            ? { error: 'ERROR_PULLING_POSTS', message: `There was an error pulling Linkedln posts. Please reach out to the SE Team to resolve this issue.` }
            : { error: 'ZERO_POSTS_RETURNED', message: `No posts were returned, please check if you provided a valid Linkedln address and the page your are pulling from have posts with images associated with them. If this is the case, sorry for the inconvience. Please reach out to the admin(s) of this API to resolve this issue.` });

        const errorPostTitle = !posts.success
            ? 'SB NEWS GEN: Issue Pulling Post, please reach out to admin'
            : 'SB NEWS GEN: No Posts Returned, please make sure your are entering the correct Company URL. If issue continues, please reach out to admin'
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, errorPostTitle, 'Please delete this article once no longer needed', '');
        return;
    }

    return posts;
}

const postFilter = (post) => {
    // Check for required content and early return if missing
    if (!post.content && !post.commentary && !post.socialContent) return;

    const filteredPostObject = {
        postText: '',
        postImage: '',
        originalPostURL: ''
    }
    // Check for images in different content types using optional chaining
    const imageComponentImages = post.content?.['com.linkedin.voyager.feed.render.ImageComponent']?.images;
    if (imageComponentImages) {
        imageComponentImages.forEach(image => {
            const url = image.attributes[0].vectorImage.rootUrl + image.attributes[0].vectorImage.artifacts[0].fileIdentifyingUrlPathSegment;
            filteredPostObject.postImage = url;
        });
    }


    const articleComponentSmallImage = post.content?.['com.linkedin.voyager.feed.render.ArticleComponent']?.smallImage;
    if (articleComponentSmallImage) {
        const url = articleComponentSmallImage.attributes[0].vectorImage.rootUrl + articleComponentSmallImage.attributes[0].vectorImage.artifacts[0].fileIdentifyingUrlPathSegment;
        filteredPostObject.postImage = url;
    }

    const linkedInVideoComponentvideoPlayMetadata = post.content?.['com.linkedin.voyager.feed.render.LinkedInVideoComponent']?.videoPlayMetadata?.thumbnail;
    if (linkedInVideoComponentvideoPlayMetadata) {
        const url = linkedInVideoComponentvideoPlayMetadata.rootUrl + linkedInVideoComponentvideoPlayMetadata.artifacts[0].fileIdentifyingUrlPathSegment
        filteredPostObject.postImage = url;

    }

    const commentaryText = post.commentary?.text?.text;
    commentaryText && (filteredPostObject.postText = commentaryText);

    const socialContentShareUrl = post.socialContent?.shareUrl;
    socialContentShareUrl && (filteredPostObject.originalPostURL = socialContentShareUrl);

    if (filteredPostObject.originalPostURL === '' || filteredPostObject.postImage === '' || filteredPostObject.postText === '') return;
    return filteredPostObject;

}

export const bulkScrapeLinkedinToStaffbaseArticle = async (req, res, next) => {
    const totalPost = req.body.totalPosts;
    const numPostsToScrape = req.body.hasOwnProperty('totalPosts') ? Math.ceil(Number(req.body.totalPosts) * 2) : 1000;
    const channelID = req.body.channelID;
    let errorsObject = { totalErrors: 0, errorMessages: {} };
    let successes = 0;
    let jobComplete = false;

    const posts = await precheck(req, res, sbAuthKey, numPostsToScrape);
    if (!posts) return;

    const channelType = await getChannelType(sbAuthKey, channelID);
    //Once we have are post, loop through each post to pull needed data, run the text through Gemini, and post to Staffbase
    const postPromises = posts.items.map(async (post) => {
        //filter post to get post with images and gather data needed
        const filteredPostObject = postFilter(post);
        if (!filteredPostObject) return;


        const staffbaseCDNPost = await uploadMediaToStaffbase(sbAuthKey, filteredPostObject.postImage, 'Gen Photo');

        if (!staffbaseCDNPost.success) {
            errorsObject.totalErrors++;
            const key = `error ${errorsObject.totalErrors}`;
            errorsObject.errorMessages[key] = 'Error posting image to Staffbase CDN';
            return;
        }

        //All data is now captured, run the commentaryText(LinkedIn Post Text) through Gemini to get full article text and title
        const titleAndBodyText = channelType === 'articles' ? await generateArticleText(filteredPostObject.postText) : await generateUpdateText(filteredPostObject.postText);
        if (!titleAndBodyText.success) {
            errorsObject.totalErrors++;
            const key = `error ${errorsObject.totalErrors}`;
            errorsObject.errorMessages[key] = titleAndBodyText.errorMessage;
            return;
        }

        const bodyText = channelType === 'articles' ? titleAndBodyText.body : `${titleAndBodyText.body} \n\n <div class="media-box"><img height=${staffbaseCDNPost.data.height} width=${staffbaseCDNPost.data.width} src='${staffbaseCDNPost.data.previewUrl}'/>/div>`;
        let imageObject = '';
        if (channelType === 'articles') {
            /*
            const regex = /\/raw\/upload\/(.+)\.jpg/; // Regular expression pattern
            const match = staffbaseCDNPost.data.url.match(regex);
            imageURL = `https://app.staffbase.com/api/media/secure/external/v2/image/upload/${match[1].trim()}.jpg`;
            console.log(imageURL);
            */
            //postImage = filteredPostObject.postImage;
            imageObject = staffbaseCDNPost.data.transformations;
        }

        const postToSB = await createStaffbaseArticle(sbAuthKey, channelID, titleAndBodyText.title, bodyText, imageObject);
        if (!postToSB.success) {
            errorsObject.totalErrors++;
            const key = `error ${errorsObject.totalErrors}`;
            errorsObject.errorMessages[key] = postToSB.error;
            return;
        }

        successes++;
        return () => article;
    });

    /*
    await Promise.all(postPromises).then(() => {
        res.status(200).json({ data: { successes, errors: errorsObject } });
        jobComplete = true;
    }).catch((error) => {
        console.error('Error from Promise.all:', error);
    });*/

    for await (const postPromise of postPromises) {
        console.log('one post done');
    }
    jobComplete = true;
    if (jobComplete) {
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: ${successes} Articles Successfully Generated`, 'Please Delete This Article', '');
    }
    res.status(200).json({ data: { successes, errors: errorsObject } });
}

const retryAsyncOperation = async (asyncOperation, maxRetries = 3, retryCondition = (error) => error.status === 503) => {
    let attempt = 1;

    while (attempt <= maxRetries) {
        try {
            const result = await asyncOperation();
            return result;
        } catch (error) {
            if (retryCondition) {
                const delay = (2 ** attempt) * 1000;
                console.warn(`Retrying attempt ${attempt} in ${delay}ms... (Error: ${error.message})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error("Non-retryable error:", error);
                return;
            }
        }
        attempt++;
    }
    console.error('Retries failed');
    return;
}

export const bulkScrapeLinkedinToStaffbaseArticleWithChannels = async (req, res, next) => {
    const sbAuthKey = req.headers.authorization.split(' ')[1];
    const numPostsToScrape = req.body.hasOwnProperty('totalPosts') ? Math.ceil(Number(req.body.totalPosts) * 2) : 1000;
    const cookies = await getLinkedinCookies();
    if (!cookies.success) {
        res.status(401).json({ error: 'NO_AUTH_COOKIES', message: 'There was an error in retrieving authentication cookies. Sorry for the inconvience. Please reach out to the SE Team to resolve this issue.' });
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: No AUTH Cookies, Please reach out to SE Team to resolve`, 'Please delete this article once no longer needed', '');
        return;
    }

    const gemTest = await generateArticleText('Write a short story about a robot who dreams of becoming a stand-up comedian. What challenges does it face? What kind of jokes does it tell?');
    if (!gemTest.success && [400, 403].includes(gemTest.error.status)) {
        res.status(403).json({ error: 'NO_GEMINI_AUTH', message: `There is an issue with the Gemini Authentication. Please reach out to the SE Team to resolve this issue.` })
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: No GEMINI AUTH, Please reach out to SE Team to resolve`, 'Please delete this article once no longer needed', '');
        console.error(gemTest.error);
        return;
    }

    //get linkedin posts
    const apifyPosts = await scrapeLinkedinPostsRawData(cookies.cookies, numPostsToScrape, req.body.pageURL);

    //check if posts are valid before proceeding. If not, return a 400 error
    if (!apifyPosts.success || apifyPosts.items.length === 0) {
        console.log(apifyPosts);
        res.status(400).json(!apifyPosts.success
            ? { error: 'ERROR_PULLING_POSTS', message: `There was an error pulling Linkedln posts. Please reach out to the SE Team to resolve this issue.` }
            : { error: 'ZERO_POSTS_RETURNED', message: `No posts were returned, please check if you provided a valid Linkedln address and the page your are pulling from have posts with images associated with them. If this is the case, sorry for the inconvience. Please reach out to the admin(s) of this API to resolve this issue.` });

        const errorPostTitle = !apifyPosts.success
            ? 'SB NEWS GEN: Issue Pulling Post, please reach out to admin'
            : 'SB NEWS GEN: No Posts Returned, please make sure your are entering the correct Company URL. If issue continues, please reach out to admin'
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, errorPostTitle, 'Please delete this article once no longer needed', '');
        return;
    }

    /*
    apifyPosts.items.forEach(async (apifyPost) => {
        const filteredApifyPost = postFilter(apifyPost);
        const generatedArticle = await generateArticleText(filteredApifyPost.postText);
        console.log(generatedArticle);
    })*/
    const staffbasePosts = {};
    let articlesString = '';
    let successfulGenCounter = 1;

    //for each li post scraped, generate a article text and save data to StaffbasePosts object and append article body to string
    for (const apifyPost of apifyPosts.items) {
        let articleGenerationAttempts = 1;
        const filteredApifyPost = postFilter(apifyPost);

        if (!filteredApifyPost) continue;

        const generatedArticle = await retryAsyncOperation(async () => {
            return await generateArticleText(filteredApifyPost.postText);
        });
        if (!generatedArticle.success || !generatedArticle) continue;
        staffbasePosts[`${successfulGenCounter}`] = {
            title: generatedArticle.title,
            body: generatedArticle.body,
            image: filteredApifyPost.postImage,
            urlToOriginalPost: filteredApifyPost.originalPostURL
        }
        articlesString = articlesString + '\n' + `article ${successfulGenCounter}` + '\n' + generatedArticle.body;
        successfulGenCounter++;
        console.log(successfulGenCounter);
    }


    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const context = 'Imagine that I am creating a newspaper with different news sections like Top News, Local News, Employee Recognition, Health, Industry News, etc.';
        const fullPrompt = `${context}
Based on the following articles, generate a list of news sections and place each article in the section you think it belongs to. 
${articlesString}
Provide your answer in json in the following format:
{
	Section 1: [0, 3, …],
	Section 2: [5, 7, …],
	…
}
In your outputted JSON, make sure that there are no sections that contain a empty array ([]) and order the sections in accordance to what you will believe will be the most important news sections to read first.
Make sure to return your outputted JSON as a string and not in markdown.
        `;

        //ask gemini to create channel names and place article in approiate channels. Return that info in JSON
        const result = await retryAsyncOperation(async () => {
            return await model.generateContent(fullPrompt);
        });
        let jsonResult = result.response.text();
        const jsonRegex = /```json\n([\s\S]*?)\n```/;
        const match = jsonResult.match(jsonRegex);
        jsonResult = match[1].trim();
        //Parse JSON String
        const channelsObject = JSON.parse(jsonResult);
        console.log(channelsObject);
        //get generates channel names from JSON
        const channelNames = Object.keys(channelsObject);
        console.log(staffbasePosts);
        for(const channelName of channelNames){
            console.log(channelName);
            const channelID = await createSBNewsChannel(sbAuthKey, channelName);
            await publishSBNewsChannel(sbAuthKey, channelID);
            const articlesArr = channelsObject[channelName];
            if(articlesArr.length > 0){
                for(const articleID in articlesArr){
                    console.log(articleID);
                    const articleObject = staffbasePosts[articleID];
                    console.log(articleObject);
                    //get article form apifyPost Object
                    //upload image to CDN
                }
            }            
        }

        //create articles
        for (const channelName of channelNames) {
            //const channelID = 
        }
        //loop through JSON and begin to create channels and posts for each channel
        /*
        for (const key in channelsObject) {
            if (channelsObject.hasOwnProperty(key)) {
                //create channel based on key
                const browser = await puppeteer.launch({ headless: false }); // Set headless to false to see the browser
                const page = await browser.newPage();
                try {
                    await page.goto('https://app.staffbase.com/');
                } catch (error) {

                }
                const value = channelsObject[key];
                console.log(`Key: ${key}, Value: ${value}`);
            }
        }*/
    } catch (error) {
        console.log(error);
    }
}