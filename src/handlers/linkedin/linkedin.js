import { getLinkedinCookies, generateArticleText, createStaffbaseArticle, scrapeLinkedinPostsRawData, generateUpdateText, getChannelType, uploadMediaToStaffbase, generateContentText } from "../../utils/reusableFunctions.js";
import axios, { spread } from 'axios';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { addNewsPageToSBNewsChannel, addNewsPageToSBNewsChannelWithRetry, createSBNewsChannel, deleteSBNewsChannel, getAllNewPages, getSBNewsChannel, getSBNewsChannels, getSBNewsChannelsBranch, getSBPage, getSBSpaces, getSBUsers, publishSBNewsChannel, unpublishSBNewsChannel, updateSBNewsChannel } from "../../utils/sbChannelCRUD.js";
import { JSDOM } from 'jsdom';
import pLimit from 'p-limit';

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

/**
 * @function isValidJSON
 * @description Checks if a given string is a valid JSON string.
 *
 * This function attempts to parse the input string using `JSON.parse()`.
 * If the parsing is successful, it means the string is valid JSON, and the function returns `true`.
 * If `JSON.parse()` throws an error (e.g., `SyntaxError`) during parsing,
 * it indicates that the string is not valid JSON, and the function returns `false`.
 *
 * @param {string} str The string to be checked for JSON validity.
 * @returns {boolean} `true` if the string is valid JSON, `false` otherwise.
 *
 */
const isValidJSON = str => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

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

    //valid that that whatever provided in channelID is something that we can work with
    //if channelID is none we will valid if they have provided the correct authKey before proceeding. We do this by seeing if we are able to pull spaces from that env and pull the accessorID for the all employee space.
    if (channelID === 'none' || channelID === 'cusstard') {
        const spaces = await getSBSpaces(sbAuthKey);
        if (!spaces.success) {
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
    }
    //else would be us assuming they added actual a channelID
    else {
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

    //If channel is set to none beign the operation of creating channels and articles based on linkedin posts. 
    if (channelID === 'none') {
        const staffbasePosts = {}; //Object will be used as database for all posts  include title & body produced by gemini, image url, and orginal linkedin post url
        let successfulGenCounter = 1; //loop counter/key setter
        let articlesString = ''; //string that will be used to append all article bodies that will be leveraged later to generate channel names

        //loops through pulled apify posts
        let postPromises = apifyPosts.items.map(async (post) => {
            return limit(async () => {
                //filter post to get post with images and gather data needed
                const filteredPostObject = postFilter(post);
                if (!filteredPostObject) return; // if we cant filter post, return blank to skip this iteration.

                //generate article text for each post using gemini
                const contentText = await generateContentText(filteredPostObject.postText, 'articles');
                if (!contentText.success) {
                    errorsObject.totalErrors++;
                    const key = `error ${errorsObject.totalErrors}`;
                    errorsObject.errorMessages[key] = 'Error generating text from gemini';
                    return; //if gemini could not generate text, return blank to skip iteration
                }

                //once we have all info for post, add it as a entry to the Staffbase Post object. This will be used as dictionary featuring a unique
                //id for each posts that will be later used to map what article should go to which created channel by gemini.
                staffbasePosts[successfulGenCounter] = {
                    title: contentText.contentText.title,
                    body: contentText.contentText.body,
                    image: filteredPostObject.postImage,
                    urlToOriginalPost: filteredPostObject.originalPostURL
                }

                //This is a long string, that operates as document features a list of article text and a unique id attached to it.
                //this will be fed to gemini in which will ask it to create channels names based on the data and to map the article by its ID to its associated channel
                articlesString = articlesString + '\n' + `article ${successfulGenCounter}` + '\n' + contentText.contentText.body + '\n';
                successfulGenCounter++;
            })
        })

        try {
            await Promise.all(postPromises);
        } catch (error) {
            res.status(400).json({ error: "ISSUE_PROCESSING_POST", message: "There was an issue processing posts. Please try again" })
            return;
        }

        //now that we have all the data that we need from apify we provide that to gemini and create channels and articles based on that data
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
            //retry if unsuccessful
            const result = await retryAsyncOperation(async () => {
                return await model.generateContent(fullPrompt);
            });

            let jsonResult = result.response.text();
            // Attempt to parse the Gemini response as JSON. It might be wrapped in markdown.
            if (jsonResult.indexOf("json") !== -1 && jsonResult.indexOf("```") !== -1) {
                const jsonRegex = /```json\n([\s\S]*?)\n```/;
                const match = jsonResult.match(jsonRegex);
                jsonResult = match[1].trim();
                jsonResult = JSON.parse(jsonResult);
            } else if (isValidJSON(jsonResult)) {
                jsonResult = JSON.parse(jsonResult);
            } else {
                res.status(400).json({ error: "UNEXPECTED_GEMINI_RETURN", message: "There was a unexpected return in Gemini data. Please try again." })
                return;
            }

            const channelsObject = jsonResult;
            const responseBody = {
                "Channels Created + Count": {},
                "Errors": {}
            }
            //get generates channel names from returned JSON
            const channelNames = Object.keys(channelsObject);
            postPromises = channelNames.map(async channelName => {
                const createChannel = await createSBNewsChannel(sbAuthKey, channelName, accessorIDs);
                const errors = []
                if (!createChannel.success) {
                    errors.push(`Error creating channel ${channelName}`);
                    return;
                }
                //add success to message to response body and success 0 for count.
                responseBody["Channels Created + Count"][channelName] = 0;
                const channelID = createChannel.data;

                const publishChannel = await publishSBNewsChannel(sbAuthKey, channelID);
                if (!publishChannel.success)
                    errors.push(`Error publishing channel ${channelName}`);

                //console.log(`Channel ${channelName} has been added and published`);
                //pull array from Gemini JSON return. The array provides the article IDs for the channel we just created
                const articlesIDArr = channelsObject[channelName];

                //make sure array has items
                if (articlesIDArr.length > 0) {
                    //loop through ID array and add content to channel in question.
                    const articlePromises = articlesIDArr.map(async articleID => {
                        //get article data from posts object
                        const article = staffbasePosts[articleID];

                        //check if there is a actual and that article has all the needed data
                        if (article && article.title.length > 0 && article.body.length > 0 && article.image.length > 0) {
                            //upload the article images to the SB CDN
                            const staffbaseCDNPost = await uploadMediaToStaffbase(sbAuthKey, article.image, 'Gen Photo');
                            if (!staffbaseCDNPost.success) {
                                errors.push(`Error adding article Image to Staffbase CDN for channel ${channelName}. Will skip to the next article`);
                                return;
                            }
                            const imageObject = staffbaseCDNPost.data.transformations;
                            const createArticle = await createStaffbaseArticle(sbAuthKey, channelID, article.title, article.body, imageObject);
                            if (!createArticle.success) {
                                errors.push(`Error adding article to for channel ${channelName}. Will skip to the next article.`);
                                return;
                            }
                            responseBody["Channels Created + Count"][channelName] = responseBody["Channels Created + Count"][channelName] + 1;
                            if (errors.length > 0)
                                responseBody["Errors"] = errors;
                            console.log(`Article ${articleID} has been added to channel ${channelName}`)
                        }

                    })

                    await Promise.all(articlePromises);
                }
            });
            await Promise.all(postPromises);
            res.status(200).json({ data: responseBody });

        } catch (error) {
            console.log(error)
        }

    } else if (channelID === "cusstard") {
        const responseBody = {

        }

        /*****
         * 
         * 
         * 1. Look for user 'Jeni Staffbase'. This user will be responsible for varifying which channel was generated
         * 
         * 
         * ****/

        //Get all staffbase users in branch
        const sbUsers = await getSBUsers(sbAuthKey);
        //if unsucessful, return a error
        if (!sbUsers.success) {
            res.status(400).json({ error: "ERROR_PULLING_SB_USER_DATA", message: "There was a unexpected issue pulling SB user data. Please try again. If issue persist, please reach out to the manager of this script." })
            return;
        }

        //initial variable to hold user ID for user Jeni Staffbase
        let jeniStaffbaseUserID = null;

        //loop through user objects to find user id of Jeni Staffbase and save it
        sbUsers.data.forEach(user => {
            if (user.firstName === 'Jeni' && user.lastName === 'Staffbase') {
                jeniStaffbaseUserID = user.id;
            }
        })

        if (jeniStaffbaseUserID === null) {
            res.status(400).json({ error: "ERROR_WHERES_JENI", message: "I can't find user Jeni Staffbase. Please create a user with first name, Jeni, and last name, Staffbase, in oder to proceed. Signing up for this user is not required" })
            return;
        }
        /*******
         * 
         * 
         * 
         * 2. Look for any channels in which Jeni is a Editor and delete them*
         * 
         * 
         * 
         * ************/

        //get list of all channels in branch
        const allChannelsInBranch = await getSBNewsChannelsBranch(sbAuthKey);
        if (!allChannelsInBranch.success) {
            res.status(400).json({ error: "ERROR_PULLING_SB_BRANCH_CHANNELS", message: "There was a unexpected issue pulling SB branch channel data for old branded channel deletion. Please try again. If issue persist, please reach out to the manager of this script." })
            return;
        }

        //loop through channels object for channel ids
        allChannelsInBranch.data.forEach(async branchChannel => {
            //save id of channel
            const branchChannelId = branchChannel.id;

            //get data object on the individual channel to check out who are the admins. If it's Jeni, delete the channel
            const channel = await getSBNewsChannel(sbAuthKey, branchChannelId); //get channel object
            //if unsuccessful, return error
            if (!channel.success) {
                res.status(400).json({ error: "ERROR_PULLING_SB_CHANNEL_DATA", message: "There was a unexpected issue pulling a channel's data to check for deletion. Please try again. If issue persist, please reach out to the manager of this script." })
                return;
            }

            //get admin data for channel to potentially look for jeni as admin
            const channelAdminData = channel.data.admins;
            //check to see if channel has any user admins
            if (channelAdminData.hasOwnProperty('users') && channelAdminData.users.total > 0) {
                //if yes, loop through users and see if any of the ids match jeni's and delete it
                const deleteChannelPromises = channelAdminData.users.data.map(async channelAdminUser => {
                    //check for match and delete
                    if (channelAdminUser.id === jeniStaffbaseUserID) {
                        const deleteChannel = await deleteSBNewsChannel(sbAuthKey, branchChannelId);
                        if (!deleteChannel) {
                            console.log(`error deleting channel ${branchChannelId}`)
                        }
                        console.log(`deleted channel ${branchChannelId}`)
                    }
                });
                await Promise.all(deleteChannelPromises);
            }
        });

        /*********
         * 
         * 
         * 
         * 3. Look for the desired news pages to append to news channels we will create later (do we create them if they do not exist?)**
         * 
         * 
         * 
         * ******/
        const newsPagesDictionary = await getAllNewPages(sbAuthKey, accessorIDs, ["Global News", "Local News", "Industry News", "Social Feed"]);
        if (!newsPagesDictionary.success) {
            console.error('issue look for all desire news pages')
        }

        /******
         * 
         * 
         * 
         * 
         * 4. Create 4 channels template channels, map each one to the correct news page, and assign Jeni as a editor for each
         * 
         * 
         * 
         * ********/

        //channnels to create
        const channelsToCreate = ["Top News", "My News", "Industry News", "Social Posts"];

        //object to save id of created channels
        const channelDictionary = {};

        //loop through channels we need to create and create them
        channelsToCreate.forEach(async channel => {
            let menuFolderIDs = [];
            switch (channel) {
                case "Top News":
                    menuFolderIDs = newsPagesDictionary.data["Global News"];
                    break;
                case "My News":
                    menuFolderIDs = newsPagesDictionary.data["Local News"];
                    break;
                case "Industry News":
                    menuFolderIDs = newsPagesDictionary.data["Industry News"];
                    break;
                case "Social Posts":
                    menuFolderIDs = newsPagesDictionary.data["Social Feed"];
                    break;
            }

            //create channel
            let createChannel = null;
            if (channel === "Social Posts")
                createChannel = await createSBNewsChannel(sbAuthKey, channel, accessorIDs, [jeniStaffbaseUserID], "updates");
            else
                createChannel = await createSBNewsChannel(sbAuthKey, channel, accessorIDs, [jeniStaffbaseUserID]);

            //channel id of newly created channel
            const createdChannelID = createChannel.data;

            //update channel to assign news page
            const updateChannel = await addNewsPageToSBNewsChannelWithRetry(sbAuthKey, accessorIDs, menuFolderIDs, createdChannelID);
            if (!updateChannel.success) {
                console.log(updateChannel.data);
            }

            //publish channel
            const publishChannel = await publishSBNewsChannel(sbAuthKey, createdChannelID);

            //save channel id to object. We are lowercasing the channel name for easier look up later when working with gemini
            channelDictionary[channel.toLowerCase().trim()] = createdChannelID;

        });

        /*******
         * 
         * 
         * 
         * 5. Loop through scrapped post and save data
         * 
         * 
         * 
         * 
         * **********/
        const staffbasePosts = {}; //Object will be used as database for all posts  include title & body produced by gemini, image url, and orginal linkedin post url
        let successfulGenCounter = 1; //loop counter/key setter
        let articlesString = ''; //string that will be used to append all article bodies that will be leveraged later to generate channel names

        //loops through pulled apify posts
        let postPromises = apifyPosts.items.map(async (post) => {
            return limit(async () => {
                //filter post to get post with images and gather data needed
                const filteredPostObject = postFilter(post);
                if (!filteredPostObject) return; // if we cant filter post, return blank to skip this iteration.

                //generate article text for each post using gemini
                let contentText = await generateContentText(filteredPostObject.postText, 'articles');
                if (!contentText.success) {
                    errorsObject.totalErrors++;
                    const key = `error ${errorsObject.totalErrors}`;
                    errorsObject.errorMessages[key] = 'Error generating text from gemini';
                    return; //if gemini could not generate text, return blank to skip iteration
                }

                //once we have all info for post, add it as a entry to the Staffbase Post object. This will be used as dictionary featuring a unique
                //id for each posts that will be later used to map what article should go to which created channel by gemini.
                staffbasePosts[successfulGenCounter] = {
                    title: contentText.contentText.title,
                    body: contentText.contentText.body,
                    image: filteredPostObject.postImage,
                    urlToOriginalPost: filteredPostObject.originalPostURL
                }

                //This is a long string, that operates as document features a list of article text and a unique id attached to it.
                //this will be fed to gemini in which will ask it to create channels names based on the data and to map the article by its ID to its associated channel
                articlesString = articlesString + '\n' + `article ${successfulGenCounter}` + '\n' + contentText.contentText.body + '\n';
                successfulGenCounter++;

                //Lastly generate content for the social wall by generating text and then posting it immediately to the social wall
                contentText = await generateContentText(filteredPostObject.postText, 'updates');
                if (!contentText.success) {
                    errorsObject.totalErrors++;
                    const key = `error ${errorsObject.totalErrors}`;
                    errorsObject.errorMessages[key] = 'Error generating text from gemini';
                    return; //if gemini could not generate text, return blank to skip iteration
                }

                const staffbaseCDNPost = await uploadMediaToStaffbase(sbAuthKey, filteredPostObject.postImage, 'Gen Photo');
                if (!staffbaseCDNPost.success) {
                    console.log('cdn error')
                    //errors.push(`Error adding article Image to Staffbase CDN for channel ${channelName}. Will skip to the next article`);
                    return;
                }
                
                const updateRequestBody = `${contentText.contentText.body} \n\n <div class="media-box"><img height=${staffbaseCDNPost.data.height} width=${staffbaseCDNPost.data.width} src='${staffbaseCDNPost.data.previewUrl}'/>/div>`
                const createPostToSocialPosts = await createStaffbaseArticle(sbAuthKey, channelDictionary["social posts"], contentText.contentText.title, updateRequestBody);
                if (!createPostToSocialPosts.success) {
                    console.log('error posing to social posts')
                }
            })
        })

        try {
            await Promise.all(postPromises);
        } catch (error) {
            console.log(error)
            return;
        }

        /********
         * 
         * 
         * 
         * 
         * 6. Have Gemini map what article belongs to what article
         * 
         * 
         * 
         * 
         * 
         * *********/

        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const context = 'Imagine that I am creating a newspaper with different news sections known as news channels.';
            const fullPrompt = `${context}
    Based on the following articles, generate a list of 4 news channels that goes as follows: top news, my news, industry news, and social posts.
    
    Here are the articles:
    ${articlesString}

    Provide your answer in json in the following format:
    {
        news channel: [0, 3, …],
        news channel: [5, 7, …],
        …
    }
    In your outputted JSON, make sure that there are no sections that contain a empty array ([]) and make sure each news channel contains at least 6 articles.
    Make sure to return your outputted JSON.
            `;
            //ask gemini to create channel names and place article in approiate channels. Return that info in JSON
            //retry if unsuccessful
            const result = await retryAsyncOperation(async () => {
                return await model.generateContent(fullPrompt);
            });

            let jsonResult = result.response.text();
            // Attempt to parse the Gemini response as JSON. It might be wrapped in markdown.
            if (jsonResult.indexOf("json") !== -1 && jsonResult.indexOf("```") !== -1) {
                const jsonRegex = /```json\n([\s\S]*?)\n```/;
                const match = jsonResult.match(jsonRegex);
                jsonResult = match[1].trim();
                jsonResult = JSON.parse(jsonResult);
            } else if (isValidJSON(jsonResult)) {
                jsonResult = JSON.parse(jsonResult);
            } else {
                res.status(400).json({ error: "UNEXPECTED_GEMINI_RETURN", message: "There was a unexpected return in Gemini data. Please try again." })
                return;
            }

            console.log(jsonResult);
            //get the keys of the object that Gemini returned. The expect output should have been a object containing channels with arrays of article ids for articles to add.
            const geminiChannelNames = Object.keys(jsonResult);

            //
            const postingToChannelsPromises = geminiChannelNames.map(async channelName => {
                if (channelName === "Social Posts") {
                    return;
                }
                //clean up news page title in case gemini did not return it all lowercase
                const channelNameLowerCase = channelName.toLowerCase().trim();
                console.log(channelDictionary)
                console.log(channelName)
                //double check the desired newspage and article ids were returned
                let articlesToAdd = null
                if (channelDictionary.hasOwnProperty(channelNameLowerCase))
                    articlesToAdd = jsonResult[channelName];
                else {
                    console.log(`gemini did not provide channel ${channelName} in its return`);
                    return;
                }

                if (articlesToAdd.length === 0) {
                    console.log(`gemini did provide any channel ids for channel ${channelName}`);
                    return;
                }
                //save channel id for channel we sill be posting to
                const channelId = channelDictionary[channelNameLowerCase];
                //loop through the articles ids that should be associated with this channel
                const postToChannelPromises = articlesToAdd.map(async articleId => {

                    const article = staffbasePosts[articleId];

                    //check if there is a actual and that article has all the needed data
                    if (article && article.title.length > 0 && article.body.length > 0 && article.image.length > 0) {
                        //upload the article images to the SB CDN
                        const staffbaseCDNPost = await uploadMediaToStaffbase(sbAuthKey, article.image, 'Gen Photo');
                        if (!staffbaseCDNPost.success) {
                            console.log('cdn error')
                            //errors.push(`Error adding article Image to Staffbase CDN for channel ${channelName}. Will skip to the next article`);
                            return;
                        }
                        const imageObject = staffbaseCDNPost.data.transformations;


                        const createArticle = await createStaffbaseArticle(sbAuthKey, channelId, article.title, article.body, imageObject);

                        if (!createArticle.success) {
                            console.log('article creation error')
                            //errors.push(`Error adding article to for channel ${channelName}. Will skip to the next article.`);
                            return;
                        }
                    }
                });

                await Promise.all(postToChannelPromises);
            })
            await Promise.all(postingToChannelsPromises);

        } catch (error) {
            console.log(error);
        }
        //7. Return response
        res.status(200).json({ success:true, message: 'just maybe im done. check me out.' });
    }
    else {
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

// export const bulkScrapeLinkedinToStaffbaseArticleWithChannels = async (req, res, next) => {
//     const sbAuthKey = req.headers.authorization.split(' ')[1];
//     const numPostsToScrape = req.body.hasOwnProperty('totalPosts') ? Math.ceil(Number(req.body.totalPosts) * 2) : 1000;
//     const cookies = await getLinkedinCookies();
//     if (!cookies.success) {
//         res.status(401).json({ error: 'NO_AUTH_COOKIES', message: 'There was an error in retrieving authentication cookies. Sorry for the inconvience. Please reach out to the SE Team to resolve this issue.' });
//         await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: No AUTH Cookies, Please reach out to SE Team to resolve`, 'Please delete this article once no longer needed', '');
//         return;
//     }

//     const gemTest = await generateArticleText('Write a short story about a robot who dreams of becoming a stand-up comedian. What challenges does it face? What kind of jokes does it tell?');
//     if (!gemTest.success && [400, 403].includes(gemTest.error.status)) {
//         res.status(403).json({ error: 'NO_GEMINI_AUTH', message: `There is an issue with the Gemini Authentication. Please reach out to the SE Team to resolve this issue.` })
//         await createStaffbaseArticle(sbAuthKey, req.body.channelID, `SB NEWS GEN: No GEMINI AUTH, Please reach out to SE Team to resolve`, 'Please delete this article once no longer needed', '');
//         console.error(gemTest.error);
//         return;
//     }

//     //get linkedin posts
//     const apifyPosts = await scrapeLinkedinPostsRawData(cookies.cookies, numPostsToScrape, req.body.pageURL);

//     //check if posts are valid before proceeding. If not, return a 400 error
//     if (!apifyPosts.success || apifyPosts.items.length === 0) {
//         console.log(apifyPosts);
//         res.status(400).json(!apifyPosts.success
//             ? { error: 'ERROR_PULLING_POSTS', message: `There was an error pulling Linkedln posts. Please reach out to the SE Team to resolve this issue.` }
//             : { error: 'ZERO_POSTS_RETURNED', message: `No posts were returned, please check if you provided a valid Linkedln address and the page your are pulling from have posts with images associated with them. If this is the case, sorry for the inconvience. Please reach out to the admin(s) of this API to resolve this issue.` });

//         const errorPostTitle = !apifyPosts.success
//             ? 'SB NEWS GEN: Issue Pulling Post, please reach out to admin'
//             : 'SB NEWS GEN: No Posts Returned, please make sure your are entering the correct Company URL. If issue continues, please reach out to admin'
//         await createStaffbaseArticle(sbAuthKey, req.body.channelID, errorPostTitle, 'Please delete this article once no longer needed', '');
//         return;
//     }

//     /*
//     apifyPosts.items.forEach(async (apifyPost) => {
//         const filteredApifyPost = postFilter(apifyPost);
//         const generatedArticle = await generateArticleText(filteredApifyPost.postText);
//         console.log(generatedArticle);
//     })*/
//     const staffbasePosts = {};
//     let articlesString = '';
//     let successfulGenCounter = 1;

//     //for each li post scraped, generate a article text and save data to StaffbasePosts object and append article body to string
//     for (const apifyPost of apifyPosts.items) {
//         let articleGenerationAttempts = 1;
//         const filteredApifyPost = postFilter(apifyPost);

//         if (!filteredApifyPost) continue;

//         const generatedArticle = await retryAsyncOperation(async () => {
//             return await generateArticleText(filteredApifyPost.postText);
//         });
//         if (!generatedArticle.success || !generatedArticle) continue;
//         staffbasePosts[successfulGenCounter] = {
//             title: generatedArticle.title,
//             body: generatedArticle.body,
//             image: filteredApifyPost.postImage,
//             urlToOriginalPost: filteredApifyPost.originalPostURL
//         }
//         articlesString = articlesString + '\n' + `article ${successfulGenCounter}` + '\n' + generatedArticle.body;
//         successfulGenCounter++;
//         console.log(successfulGenCounter);
//     }


//     try {
//         const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//         const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
//         const context = 'Imagine that I am creating a newspaper with different news sections.';
//         const fullPrompt = `${context}
// Based on the following articles, generate a list of at least 7 news sections that are internal communications focused and place each article in the section you think it belongs to. Make sure two of the channels are named Top News & Local News.
// ${articlesString}
// Provide your answer in json in the following format:
// {
// 	Section 1: [0, 3, …],
// 	Section 2: [5, 7, …],
// 	…
// }
// In your outputted JSON, make sure that there are no sections that contain a empty array ([]) and order the sections in accordance to what you will believe will be the most important news sections to read first.
// Make sure to return your outputted JSON as a string and not in markdown.
//         `;

//         //ask gemini to create channel names and place article in approiate channels. Return that info in JSON
//         const result = await retryAsyncOperation(async () => {
//             return await model.generateContent(fullPrompt);
//         });
//         let jsonResult = result.response.text();
//         const jsonRegex = /```json\n([\s\S]*?)\n```/;
//         const match = jsonResult.match(jsonRegex);
//         jsonResult = match[1].trim();
//         //Parse JSON String
//         const channelsObject = JSON.parse(jsonResult);
//         console.log(channelsObject);

//         const spaces = await getSBSpaces(sbAuthKey);
//         if (!spaces) return;

//         let accessorIDs = [];
//         for (const space of spaces) {
//             if (space.name === 'All employees') {
//                 accessorIDs = space.accessorIDs;
//                 break;
//             }
//         }
//         //get generates channel names from JSON
//         const channelNames = Object.keys(channelsObject);
//         for (const channelName of channelNames) {
//             const channelID = await createSBNewsChannel(sbAuthKey, channelName, accessorIDs);
//             await publishSBNewsChannel(sbAuthKey, channelID);
//             console.log(`Channel ${channelName} has been added and published`);
//             const articlesIDArr = channelsObject[channelName];
//             console.log(articlesIDArr.length);

//             if (articlesIDArr.length > 0) {
//                 articlesIDArr.forEach(async articleID => {
//                     const article = staffbasePosts[articleID];
//                     if (article.title.length > 0 && article.body.length > 0 && article.image.length > 0) {
//                         const staffbaseCDNPost = await uploadMediaToStaffbase(sbAuthKey, article.image, 'Gen Photo');
//                         const imageObject = staffbaseCDNPost.data.transformations;
//                         await createStaffbaseArticle(sbAuthKey, channelID, article.title, article.body, imageObject);
//                         console.log(`Article ${articleID} has been added to channel ${channelName}`)
//                     }

//                 })
//             }
//         }


//     } catch (error) {
//         console.log(error);
//     }
// }