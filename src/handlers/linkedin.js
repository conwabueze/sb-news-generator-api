import { getLinkedinCookies, generateArticleText, createStaffbaseArticle, scrapeLinkedinPostsRawData, generateUpdateText, getChannelType, uploadMediaToStaffbase, generateContentText } from "../utils/reusableFunctions.js";
import axios, { spread } from 'axios';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSBNewsChannel, deleteSBNewsChannel, getSBNewsChannels, getSBNewsChannelsBranch, getSBPage, getSBSpaces, publishSBNewsChannel, unpublishSBNewsChannel } from "../utils/sbChannelCRUD.js";
import { JSDOM } from 'jsdom';
import pLimit from 'p-limit';
/*
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
*/
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

//
export const bulkScrapeLinkedinToStaffbaseArticle = async (req, res, next) => {
    //payload variables
    const sbAuthKey = req.headers.authorization.split(' ')[1];
    const totalPost = req.body.totalPosts;
    const numPostsToScrape = req.body.hasOwnProperty('totalPosts') ? Math.ceil(Number(totalPost)) : 100;
    const channelID = req.body.channelID;
    const dataSourceURL = req.body.pageURL;
    //error handling and other variables
    let errorsObject = { totalErrors: 0, errorMessages: {} };
    let successes = 0;
    let jobComplete = false;
    let accessorIDs = undefined;
    //perform checks on needed services before proceeding. 

    //check if we have the correct Staffbase Token by making test request
    if (channelID === 'none') {
        const spaces = await getSBSpaces(sbAuthKey);
        if (!spaces.success) {
            console.log(spaces.error.message);
            switch (spaces.error.status) {
                case 400:
                    res.status(400).json({ error: 'INVALID_PARAMETER', message: `Invalid parameter detected. Please check your query parameters` });
                    return;
                case 401:
                    res.status(401).json({ error: 'INCORRECT_SB_AUTH', message: `Please make sure you are using the correct Staffbase API Token. If yes, ensure that it is not disabled. If all fails, reeach out to the SE Team.` });
                    return;
            }
        }
        accessorIDs = spaces.data[0].accessorIDs;
        console.log(accessorIDs);
    } else {
        const sbTestArticle = await createStaffbaseArticle(sbAuthKey, req.body.channelID, 'SB NEWS GEN: Start Up (please Delete this Article)', 'Testing the NEWS API is working. Please ignore this');
        //POST a Test Staffbase Post to ensure everything is good before proceeding
        if (!sbTestArticle.success) {
            switch (sbTestArticle.error.status) {
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
    }

    //check if we are able to successfully pull cookie data
    const cookies = await getLinkedinCookies();
    if (!cookies.success) {
        res.status(401).json({ error: 'NO_AUTH_COOKIES', message: 'There was an error in retrieving authentication cookies. Sorry for the inconvience. Please reach out to the SE Team to resolve this issue.' });
        //await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: No AUTH Cookies, Please reach out to SE Team to resolve`, 'Please delete this article once no longer needed', '');
        return;
    }

    //check if we are have a a valid token for Gemini API
    const gemTest = await generateArticleText('Write a short story about a robot who dreams of becoming a stand-up comedian. What challenges does it face? What kind of jokes does it tell?');
    if (!gemTest.success && [400, 403].includes(gemTest.error.status)) {
        res.status(403).json({ error: 'NO_GEMINI_AUTH', message: `There is an issue with the Gemini Authentication. Please reach out to the SE Team to resolve this issue.` })
        //await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: No GEMINI AUTH, Please reach out to SE Team to resolve`, 'Please delete this article once no longer needed', '');
        console.error(gemTest.error);
        return;
    }


    //begin to pull posts from data source
    const apifyPosts = await scrapeLinkedinPostsRawData(cookies.cookies, numPostsToScrape, dataSourceURL);

    //check if posts are valid before proceeding. If not, return a 400 error
    if (!apifyPosts.success || apifyPosts.items.length === 0) {
        console.log(apifyPosts);
        res.status(400).json(!apifyPosts.success
            ? { error: 'ERROR_PULLING_POSTS', message: `There was an error pulling Linkedln posts. Please reach out to the SE Team to resolve this issue.` }
            : { error: 'ZERO_POSTS_RETURNED', message: `No posts were returned, please check if you provided a valid Linkedln address and the page your are pulling from have posts with images associated with them. If this is the case, sorry for the inconvience. Please reach out to the admin(s) of this API to resolve this issue.` });

        const errorPostTitle = !apifyPosts.success
            ? 'SB NEWS GEN: Issue Pulling Post, please reach out to admin'
            : 'SB NEWS GEN: No Posts Returned, please make sure your are entering the correct Company URL. If issue continues, please reach out to admin'
        //await createStaffbaseArticle(sbAuthKey, req.body.channelID, errorPostTitle, 'Please delete this article once no longer needed', '');
        return;
    }
    const limit = pLimit(5); // Limit concurrency to 5 requests for request when using map

    if (channelID === 'none') {
        console.log('will start creating channels')
        const staffbasePosts = {}; //Object will be used as database for all posts  include title & body produced by gemini, image url, and orginal linkedin post url
        let successfulGenCounter = 1; //loop counter/key setter
        let articlesString = ''; //string that will be used to append all article bodies that will be leveraged later to generate channel names

        //loops through pulled apify posts
        const postPromises = apifyPosts.items.map(async (post) => {
            return limit(async () => {
                //filter post to get post with images and gather data needed
                const filteredPostObject = postFilter(post);
                if (!filteredPostObject) return;

                //generate text for each post using gemini
                const contentText = await generateContentText(filteredPostObject.postText, 'articles');
                if (!contentText.success) {
                    errorsObject.totalErrors++;
                    const key = `error ${errorsObject.totalErrors}`;
                    errorsObject.errorMessages[key] = 'Error generating text from gemini';
                    return;
                }

                //once we have all info for post, add it as a entry to the object
                staffbasePosts[successfulGenCounter] = {
                    title: contentText.contentText.title,
                    body: contentText.contentText.body,
                    image: filteredPostObject.postImage,
                    urlToOriginalPost: filteredPostObject.originalPostURL
                }

                articlesString = articlesString + '\n' + `article ${successfulGenCounter}` + '\n' + contentText.contentText.body + '\n';
                successfulGenCounter++;
            })
        })

        try {
            const results = await Promise.all(postPromises);
        } catch (error) {
            console.error('Error processing posts:', error);
        }

        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const context = 'Imagine that I am creating a newspaper with different news sections.';
            const fullPrompt = `${context}
    Based on the following articles, generate a list of at least 7 news sections that are internal communications focused and place each article in the section you think it belongs to. Make sure two of the channels are named Top News & Local News.
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
            for (const channelName of channelNames) {
                const channelID = await createSBNewsChannel(sbAuthKey, channelName, accessorIDs);
                await publishSBNewsChannel(sbAuthKey, channelID);
                console.log(`Channel ${channelName} has been added and published`);
                const articlesIDArr = channelsObject[channelName];
                console.log(articlesIDArr.length);

                if (articlesIDArr.length > 0) {
                    articlesIDArr.forEach(async articleID => {
                        const article = staffbasePosts[articleID];
                        if (article && article.title.length > 0 && article.body.length > 0 && article.image.length > 0) {
                            const staffbaseCDNPost = await uploadMediaToStaffbase(sbAuthKey, article.image, 'Gen Photo');
                            if(!staffbaseCDNPost.success){
                                return;
                            }
                            const imageObject = staffbaseCDNPost.data.transformations;
                            await createStaffbaseArticle(sbAuthKey, channelID, article.title, article.body, imageObject);
                            console.log(`Article ${articleID} has been added to channel ${channelName}`)
                        }

                    })
                }
            }
        } catch (error) {
            console.log(error)
        }

    } else {
        const channelType = await getChannelType(sbAuthKey, channelID);
        //Once we have are post, loop through each post to pull needed data, run the text through Gemini, and post to Staffbase

        const postPromises = apifyPosts.items.map(async (post) => {
            return limit(async () => {
                //filter post to get post with images and gather data needed
                const filteredPostObject = postFilter(post);
                if (!filteredPostObject) return;

                //upload image to Staffbase CDN
                const staffbaseCDNPost = await uploadMediaToStaffbase(sbAuthKey, filteredPostObject.postImage, `Gen Photo ${successes}`);

                if (!staffbaseCDNPost.success) {
                    errorsObject.totalErrors++;
                    const key = `error ${errorsObject.totalErrors}`;
                    errorsObject.errorMessages[key] = 'Error posting image to Staffbase CDN';
                    return;
                }

                const contentText = await generateContentText(filteredPostObject.postText, channelType);
                if (!contentText.success) {
                    errorsObject.totalErrors++;
                    const key = `error ${errorsObject.totalErrors}`;
                    errorsObject.errorMessages[key] = 'Error generating text from gemini';
                    return;
                }

                let staffbaseNewsCreationRequest = undefined;

                if (channelType === 'articles') {
                    staffbaseNewsCreationRequest = await createStaffbaseArticle(sbAuthKey, channelID, contentText.contentText.title, contentText.contentText.body, staffbaseCDNPost.data.transformations);
                } else if (channelType === 'pictures' || channelType === 'updates') {
                    const updateRequestBody = `${contentText.contentText.body} \n\n <div class="media-box"><img height=${staffbaseCDNPost.data.height} width=${staffbaseCDNPost.data.width} src='${staffbaseCDNPost.data.previewUrl}'/>/div>`
                    staffbaseNewsCreationRequest = await createStaffbaseArticle(sbAuthKey, channelID, contentText.contentText.title, updateRequestBody);
                }

                if (!staffbaseNewsCreationRequest.success) {
                    errorsObject.totalErrors++;
                    const key = `error ${errorsObject.totalErrors}`;
                    errorsObject.errorMessages[key] = staffbaseNewsCreationRequest.error;
                    console.log(staffbaseNewsCreationRequest.error);
                    return;
                }

                successes++;
            })

        });
        try {
            const results = await Promise.all(postPromises);
        } catch (error) {
            console.error('Error processing posts:', error);
        }
        /*
        jobComplete = true;
        if (jobComplete) {
            await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: ${successes} Articles Successfully Generated`, 'Please Delete This Article', '');
        }*/
        res.status(200).json({ data: { successes, errors: errorsObject } });
    }



}

/*
export const bulkScrapeLinkedinToStaffbaseArticle = async (req, res, next) => {
    const sbAuthKey = req.headers.authorization.split(' ')[1];
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

    for await (const postPromise of postPromises) {
        console.log('one post done');
    }
    jobComplete = true;
    if (jobComplete) {
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: ${successes} Articles Successfully Generated`, 'Please Delete This Article', '');
    }
    res.status(200).json({ data: { successes, errors: errorsObject } });
}*/

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
        staffbasePosts[successfulGenCounter] = {
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
        const context = 'Imagine that I am creating a newspaper with different news sections.';
        const fullPrompt = `${context}
Based on the following articles, generate a list of at least 7 news sections that are internal communications focused and place each article in the section you think it belongs to. Make sure two of the channels are named Top News & Local News.
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

        const spaces = await getSBSpaces(sbAuthKey);
        if (!spaces) return;

        let accessorIDs = [];
        for (const space of spaces) {
            if (space.name === 'All employees') {
                accessorIDs = space.accessorIDs;
                break;
            }
        }
        //get generates channel names from JSON
        const channelNames = Object.keys(channelsObject);
        for (const channelName of channelNames) {
            const channelID = await createSBNewsChannel(sbAuthKey, channelName, accessorIDs);
            await publishSBNewsChannel(sbAuthKey, channelID);
            console.log(`Channel ${channelName} has been added and published`);
            const articlesIDArr = channelsObject[channelName];
            console.log(articlesIDArr.length);

            if (articlesIDArr.length > 0) {
                articlesIDArr.forEach(async articleID => {
                    const article = staffbasePosts[articleID];
                    if (article.title.length > 0 && article.body.length > 0 && article.image.length > 0) {
                        const staffbaseCDNPost = await uploadMediaToStaffbase(sbAuthKey, article.image, 'Gen Photo');
                        const imageObject = staffbaseCDNPost.data.transformations;
                        await createStaffbaseArticle(sbAuthKey, channelID, article.title, article.body, imageObject);
                        console.log(`Article ${articleID} has been added to channel ${channelName}`)
                    }

                })
            }
        }


    } catch (error) {
        console.log(error);
    }
}

export const testRoute = async (req, res, next) => {
    const sbAuthKey = req.headers.authorization.split(' ')[1];
    const page = await getSBPage(sbAuthKey, '67955b9847eb2a43dbee1b3c');
    let pageHTML = page.contents.en_US.content;
    const dom = new JSDOM(pageHTML);
    const document = dom.window.document;
    //console.log(document.documentElement.outerHTML);
    const allDivs = document.querySelectorAll('div[data-widget-type="NewsStage"]');
    allDivs.forEach(div => {
        console.log(div.innnerHTML);
    });

    /*
    try {
        //Authorization Header
        const headers = {
            Authorization: `Basic ${sbAuthKey}`,

        }
        const baseUrl = `https://app.staffbase.com/api/channels/67953c0c2943b96047f9618f/posts`;
        
        const body = {
            contents: {
                en_US: {
                    content: "test",
                    title: "barney",
                }
            },
            hashtags: ["fefe"]
        };
        const response = await axios.post(baseUrl, body, { headers });
        console.log(response);
        return { success: true };
    } catch (error) {
        console.log(error);
        return { success: false, error, errorMessage: `Error posting article: ${error}` };
    }*/
    /*
    const test = await getSBNewsChannels(sbAuthKey);
    console.log(test);
    console.log(test.length);
    
    test.forEach(async cid => {
        await deleteSBNewsChannel(sbAuthKey, cid);
    });*/

    /*
    const test2 = await getSBNewsChannelsBranch(sbAuthKey);
    console.log(test2);
    
    test2.forEach(async cid => {
        await deleteSBNewsChannel(sbAuthKey, cid);
    }); */
    //authorID: "67603f92be16fc7fcfc2df24"
}