import { getLinkedinCookies, scrapeLinkedinPosts, generateArticleText, createStaffbaseArticle, scrapeLinkedinPostsRawData } from "../utils/reusableFunctions.js";

/*
export const bulkScrapeLinkedinToStaffbaseArticle = async (req, res, next) => {
    let errorsObject = { totalErrors: 0, errorMessages: {} };
    let successes = 0;
    let jobComplete = false;

    //Test News API before prceeding
    const sbAuthKey = req.headers.authorization.split(' ')[1]; //pull authkey from request
    //POST Article
    const sbArticleTest = await createStaffbaseArticle(sbAuthKey, req.body.channelID, 'SB NEWS GEN: Test Start, please Delete this Article', 'Testing the NEWS API is working. Please ignore this', '', false);
    //SB POST error handling
    if (!sbArticleTest.success) {
        if (!sbArticleTest.success && sbArticleTest.error.status === 404) {
            res.status(404).json({ error: 'INCORRECT_CHANNEL_ID', message: `There was an error when creating the Staffbase Article: ${sbArticleTest.error.response.data.message}. Please make sure you are using the correct channelID` });
            return;
        }
        else if (!sbArticleTest.success && sbArticleTest.error.status === 403) {
            res.status(403).json({ error: 'INCORRECT_SB_PERMISSION', message: `There was an error when creating the Staffbase Article: ${sbArticleTest.error.response.data.message}. Please make sure you have access to this branch. Your token should have the permission level of Editorial and nothing lower or higher.` });
            return;
        }
        else if (!sbArticleTest.success && sbArticleTest.error.status === 401) {
            res.status(401).json({ error: 'INCORRECT_SB_AUTH', message: `There was an error when creating the Staffbase Article: ${sbArticleTest.error.response.data.message}. Please make sure you are using the correct Staffbase API Token` });
            return;
        }
        else {
            console.log(sbArticleTest.error);
        }
    }

    //get cookies
    const cookies = await getLinkedinCookies();
    //check if cookies are successfully retrieved before proceeding
    if (!cookies.success) {
        res.status(401).json({ error: 'NO_AUTH_COOKIES', message: 'There was an error in retrieving authentication cookies. Sorry for the inconvience. Please reach out to the admin(s) of this API to resolve this issue.' });
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: No AUTH Cookies, Please reach out to admin`, 'Please delete this article once no longer needed', '', false);
        return;
    }

    //Test Gemini before proceeding with rest of handler
    const gemTest = await generateArticleText('Write a short story about a robot who dreams of becoming a stand-up comedian. What challenges does it face? What kind of jokes does it tell?');
    if (!gemTest.success && (gemTest.error.status === 400 || gemTest.error.status === 403)) {
        res.status(403).json({ error: 'NO_GEMINI_AUTH', message: `There is an issue with the Gemini Authentication. Please reach out to the admin(s) of this API to resolve this issue.` })
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: No GEMINI AUTH, Please reach out to admin`, 'Please delete this article once no longer needed', '', false);
        console.error(gemTest.error);
        return;
    }

    const numPostsToScrape = req.body.hasOwnProperty('totalPosts') ? Math.ceil(Number(req.body.totalPosts)) : 1000;
    console.log(numPostsToScrape);
    //get scraped linkedln post
    const posts = await scrapeLinkedinPosts(cookies.cookies, numPostsToScrape, req.body.pageURL);
    //check if retrieved post are vliad before proceeding
    if (!posts.success || posts.items.length === 0) {
        res.status(400).json(!posts.success
            ? { error: 'ERROR_PULLING_POSTS', message: `There was an error pulling Linkedln posts: ${posts.error}. Please reach out to the admin(s) of this API to resolve this issue.` }
            : { error: 'ZERO_POSTS_RETURNED', message: `No posts were returned, please check if you provided a valid Linkedln address and the page your are pulling from have posts with images associated with them. If this is the case, sorry for the inconvience. Please reach out to the admin(s) of this API to resolve this issue.` });

        const errorPostTitle = !posts.success
            ? 'SB NEWS GEN: Issue Pulling Post, please reach out to admin'
            : 'SB NEWS GEN: No Posts Returned, please make sure your are entering the correct Company URL. If issue continues, please reach out to admin'
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, errorPostTitle, 'Please delete this article once no longer needed', '', false);
        return;
    }

    console.log(`${posts.items.length} have been pulled from Linkedin!`);

    //Look through post and create Staffbase Articles based on what is being retrieved.
    const postPromises = posts.items.map(async (post) => {
        //if post object has a image begin article creation process 
        //we are looking for post only with images to incorporate in the Staffbase Article POST we will be performing later
        if (post.hasOwnProperty('images') || (post.hasOwnProperty('resharedPost') && post.resharedPost.hasOwnProperty('images'))) {
            //Take original scraped post text and run generateArticleText function that will return a ob

            let getArticleText = await generateArticleText(post.text);

            if (getArticleText.success) {
                const articleImage = post.hasOwnProperty('images') ? post.images[0] : post.resharedPost.images[0];


                let article = await createStaffbaseArticle(sbAuthKey, req.body.channelID, getArticleText.title, getArticleText.body, articleImage);

                if (article.success) {
                    //create article based on original scraped text
                    successes++;
                    return () => article;
                }
                else {
                    errorsObject.totalErrors++;
                    const key = `error ${errorsObject.totalErrors}`;
                    errorsObject.errorMessages[key] = article.errorMessage;
                }
            }
            else {
                errorsObject.totalErrors++;
                const key = `error ${errorsObject.totalErrors}`;
                errorsObject.errorMessages[key] = getArticleText;
            }

        }
    });


    await Promise.all(postPromises).then(() => {
        res.status(200).json({ data: { successes, errors: errorsObject } });
        jobComplete = true;
    }).catch((error) => {
        console.error('Error from Promise.all:', error);
    });

    if (jobComplete) {
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: ${successes} Articles Successfully Generated`, 'Please Delete This Article', '', false);
    }



}
*/



export const bulkScrapeLinkedinToStaffbaseArticle = async (req, res, next) => {
    const sbAuthKey = req.headers.authorization.split(' ')[1]; //pull authkey from request
    const numPostsToScrape = req.body.hasOwnProperty('totalPosts') ? Math.ceil(Number(req.body.totalPosts)) : 1000;
    const channelID = req.body.channelID;
    let errorsObject = { totalErrors: 0, errorMessages: {} };
    let successes = 0;
    let jobComplete = false;

    const sbArticleTest = await createStaffbaseArticle(sbAuthKey, req.body.channelID, 'SB NEWS GEN: Start Up (please Delete this Article)', 'Testing the NEWS API is working. Please ignore this', '', false);
    //POST a Test Staffbase Post to ensure everything is good before proceeding
    if (!sbArticleTest.success) {
        switch (sbArticleTest.error.status) {
            case 404:
                res.status(404).json({ error: 'INCORRECT_CHANNEL_ID', message: `There was an error when creating the Staffbase Article: ${sbArticleTest.error.response.data.message}. Please make sure you are using the correct channelID` });
                return;
            case 403:
                res.status(403).json({ error: 'INCORRECT_SB_PERMISSION', message: `There was an error when creating the Staffbase Article: ${sbArticleTest.error.response.data.message}. Please make sure you have access to this branch. Your token should have the permission level of Editorial and nothing lower or higher.` });
                return;
            case 401:
                res.status(401).json({ error: 'INCORRECT_SB_AUTH', message: `There was an error when creating the Staffbase Article: ${sbArticleTest.error.response.data.message}. Please make sure you are using the correct Staffbase API Token. If yes, ensure that it is not disabled.` });
                return;
            default:
                console.log(sbArticleTest.error);

        }
    }

    const cookies = await getLinkedinCookies();
    if (!cookies.success) {
        res.status(401).json({ error: 'NO_AUTH_COOKIES', message: 'There was an error in retrieving authentication cookies. Sorry for the inconvience. Please reach out to the admin(s) of this API to resolve this issue.' });
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: No AUTH Cookies, Please reach out to admin`, 'Please delete this article once no longer needed', '', false);
        return;
    }

    const gemTest = await generateArticleText('Write a short story about a robot who dreams of becoming a stand-up comedian. What challenges does it face? What kind of jokes does it tell?');
    if (!gemTest.success && [400, 403].includes(gemTest.error.status)) {
        res.status(403).json({ error: 'NO_GEMINI_AUTH', message: `There is an issue with the Gemini Authentication. Please reach out to the admin(s) of this API to resolve this issue.` })
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: No GEMINI AUTH, Please reach out to admin`, 'Please delete this article once no longer needed', '', false);
        console.error(gemTest.error);
        return;
    }

    //get linkedin posts
    const posts = await scrapeLinkedinPostsRawData(cookies.cookies, numPostsToScrape, req.body.pageURL);

    //check if posts are valid before proceeding. If not, return a 400 error
    if (!posts.success || posts.items.length === 0) {
        res.status(400).json(!posts.success
            ? { error: 'ERROR_PULLING_POSTS', message: `There was an error pulling Linkedln posts: ${posts.error}. Please reach out to the admin(s) of this API to resolve this issue.` }
            : { error: 'ZERO_POSTS_RETURNED', message: `No posts were returned, please check if you provided a valid Linkedln address and the page your are pulling from have posts with images associated with them. If this is the case, sorry for the inconvience. Please reach out to the admin(s) of this API to resolve this issue.` });

        const errorPostTitle = !posts.success
            ? 'SB NEWS GEN: Issue Pulling Post, please reach out to admin'
            : 'SB NEWS GEN: No Posts Returned, please make sure your are entering the correct Company URL. If issue continues, please reach out to admin'
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, errorPostTitle, 'Please delete this article once no longer needed', '', false);
        return;
    }

    //Once we have are post, loop through each post to pull needed data, run the text through Gemini, and post to Staffbase
    const postPromises = posts.items.map(async (post) => {
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

        const linkedInVideoComponentvideoPlayMetadata = post.content?.['com.linkedin.voyager.feed.render.LinkedInVideoComponent']?.videoPlayMetadata?.thumbnail?.artifacts[0]?.fileIdentifyingUrlPathSegment;
        linkedInVideoComponentvideoPlayMetadata && (filteredPostObject.postImage = linkedInVideoComponentvideoPlayMetadata);


        const commentaryText = post.commentary?.text?.text;
        commentaryText && (filteredPostObject.postText = commentaryText);

        const socialContentShareUrl = post.socialContent?.shareUrl;
        socialContentShareUrl && (filteredPostObject.originalPostURL = socialContentShareUrl);

        if (filteredPostObject.originalPostURL === '' || filteredPostObject.postImage === '' || filteredPostObject.postText === '') return;

        //All data is now captured, run the commentaryText(LinkedIn Post Text) through Gemini to get full article text and title
        const articleTitleAndBodyText = await generateArticleText(filteredPostObject.postText);
        if (!articleTitleAndBodyText.success) {
            errorsObject.totalErrors++;
            const key = `error ${errorsObject.totalErrors}`;
            errorsObject.errorMessages[key] = articleTitleAndBodyText.errorMessage;
            return;
        }

        const postArticleToSB = await createStaffbaseArticle(sbAuthKey, channelID, articleTitleAndBodyText.title, articleTitleAndBodyText.body, filteredPostObject.postImage);
        if (!postArticleToSB.success) {
            errorsObject.totalErrors++;
            const key = `error ${errorsObject.totalErrors}`;
            errorsObject.errorMessages[key] = postArticleToSB.errorMessage;
            return;
        }

        successes++;
        return () => article;
    });

    await Promise.all(postPromises).then(() => {
        res.status(200).json({ data: { successes, errors: errorsObject } });
        jobComplete = true;
    }).catch((error) => {
        console.error('Error from Promise.all:', error);
    });

    if (jobComplete) {
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: ${successes} Articles Successfully Generated`, 'Please Delete This Article', '', false);
    }
}
