import { getLinkedinCookies, scrapeLinkedinPosts, generateArticleText, createStaffbaseArticle, scrapeLinkedinPostsRawData, generateUpdateText, getChannelType, uploadMediaToStaffbase} from "../utils/reusableFunctions.js";

/*
export const bulkScrapeLinkedinToStaffbaseArticle = async (req, res, next) => {
    let errorsObject = { totalErrors: 0, errorMessages: {} };
    let successes = 0;
    let jobComplete = false;

    //Test News API before prceeding
    const sbAuthKey = req.headers.authorization.split(' ')[1]; //pull authkey from request
    //POST Article
    const sbTest = await createStaffbaseArticle(sbAuthKey, req.body.channelID, 'SB NEWS GEN: Test Start, please Delete this Article', 'Testing the NEWS API is working. Please ignore this', '', false);
    //SB POST error handling
    if (!sbTest.success) {
        if (!sbTest.success && sbTest.error.status === 404) {
            res.status(404).json({ error: 'INCORRECT_CHANNEL_ID', message: `There was an error when creating the Staffbase Article: ${sbTest.error.response.data.message}. Please make sure you are using the correct channelID` });
            return;
        }
        else if (!sbTest.success && sbTest.error.status === 403) {
            res.status(403).json({ error: 'INCORRECT_SB_PERMISSION', message: `There was an error when creating the Staffbase Article: ${sbTest.error.response.data.message}. Please make sure you have access to this branch. Your token should have the permission level of Editorial and nothing lower or higher.` });
            return;
        }
        else if (!sbTest.success && sbTest.error.status === 401) {
            res.status(401).json({ error: 'INCORRECT_SB_AUTH', message: `There was an error when creating the Staffbase Article: ${sbTest.error.response.data.message}. Please make sure you are using the correct Staffbase API Token` });
            return;
        }
        else {
            console.log(sbTest.error);
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
    if(linkedInVideoComponentvideoPlayMetadata){
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
    const sbAuthKey = req.headers.authorization.split(' ')[1]; //pull authkey from request
    const totalPost = req.body.totalPosts;
    const numPostsToScrape = req.body.hasOwnProperty('totalPosts') ? Math.ceil(Number(req.body.totalPosts) * 2) : 1000;
    const channelID = req.body.channelID;
    let errorsObject = { totalErrors: 0, errorMessages: {} };
    let successes = 0;
    let jobComplete = false;

    const posts = await precheck(req, res, sbAuthKey, numPostsToScrape);
    if (!posts) return;

    const channelType = await getChannelType(sbAuthKey,channelID);
    //Once we have are post, loop through each post to pull needed data, run the text through Gemini, and post to Staffbase
    const postPromises = posts.items.map(async (post) => {
        const filteredPostObject = postFilter(post);
        if(!filteredPostObject) return;

        //All data is now captured, run the commentaryText(LinkedIn Post Text) through Gemini to get full article text and title
        const titleAndBodyText = channelType === 'articles' ? await generateArticleText(filteredPostObject.postText) : await generateUpdateText(filteredPostObject.postText);
        if (!titleAndBodyText.success) {
            errorsObject.totalErrors++;
            const key = `error ${errorsObject.totalErrors}`;
            errorsObject.errorMessages[key] = titleAndBodyText.errorMessage;
            return;
        }

        const bodyText = channelType === 'articles' ? titleAndBodyText.body : `${titleAndBodyText.body} \n\n <img src='${filteredPostObject.postImage}'/>`;
        let postImage = '';
        if(channelType === 'articles'){
            const staffbaseCDNUrl = await uploadMediaToStaffbase(sbAuthKey, filteredPostObject.postImage, 'Gen Photo');
            if(!staffbaseCDNUrl.success) return;
            postImage = staffbaseCDNUrl.url;
        }
        
        const postToSB = await createStaffbaseArticle(sbAuthKey, channelID, titleAndBodyText.title, bodyText, postImage);
        if (!postToSB.success) {
            errorsObject.totalErrors++;
            const key = `error ${errorsObject.totalErrors}`;
            errorsObject.errorMessages[key] = postToSB.error;
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
        await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: ${successes} Articles Successfully Generated`, 'Please Delete This Article', '');
    }
}

export const testRoute = async (req, res, next) => {
    const sbAuthKey = req.headers.authorization.split(' ')[1]; //pull authkey from request
    const imageUrl = 'https://www.thepopverse.com/_next/image?url=https%3A%2F%2Fmedia.thepopverse.com%2Fmedia%2Fnaruto-how-to-watch-t2ib4pj1c4ue3jz1mmmcnvpvge.jpg&w=1280&q=75';
    const sbImageUrl = await uploadMediaToStaffbase(sbAuthKey, imageUrl, 'Test Image');
    const articlePost = await createStaffbaseArticle(sbAuthKey, '66f316a9d0fc9e14d95f5748', 'Test post', 'bodies', imageUrl);
    console.log(sbImageUrl);
    res.status(400).json('heyy');
}
/*
export const bulkScrapeLinkedinToStaffbaseUpdates = async (req, res, next) => {
    const sbAuthKey = req.headers.authorization.split(' ')[1]; //pull authkey from request
    const channelID = req.body.channelID;
    const totalPost = req.body.totalPosts;
    const numPostsToScrape = req.body.hasOwnProperty('totalPosts') ? Math.ceil(Number(req.body.totalPosts)) * 3 : 1000;
    let errorsObject = { totalErrors: 0, errorMessages: {} };
    let successes = 0;
    let jobComplete = false;

    const posts = await precheck(req, res, sbAuthKey, numPostsToScrape);
    if (!posts) return;

    //Once we have are post, loop through each post to pull needed data, run the text through Gemini, and post to Staffbase
    const postPromises = posts.items.map(async (post) => {
        const filteredPostObject = postFilter(post);
        if(!filteredPostObject) return;

        //All data is now captured, run the commentaryText(LinkedIn Post Text) through Gemini to get full article text and title

        const geminiPost = await generateUpdateText(filteredPostObject.postText);
        if (!geminiPost.success) {
            errorsObject.totalErrors++;
            const key = `error ${errorsObject.totalErrors}`;
            errorsObject.errorMessages[key] = geminiPost.errorMessage;
            return;
        }

        const updateBody = `${geminiPost.body} \n\n <img src='${filteredPostObject.postImage}'/>`

        const postUpdateToSB = await createStaffbaseArticle(sbAuthKey, channelID, geminiPost.title, updateBody, '');
        if (!postUpdateToSB.success) {
            errorsObject.totalErrors++;
            const key = `error ${errorsObject.totalErrors}`;
            errorsObject.errorMessages[key] = postUpdateToSB.errorMessage;
            return;
        }

        successes++;
        console.log(successes);
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
}*/