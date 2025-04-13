import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * @async
 * @function getCampaigns
 * @description Retrieves a list of campaigns from the Staffbase API.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the campaign data returned by the Staffbase API.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.get` call fails (though this is caught and returned within the promise).
 */
const getCampaigns = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/campaigns';

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
    };

    try {
        const response = await axios.get(url, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

/**
 * @async
 * @function createCampaign
 * @description Creates a new campaign in Staffbase.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string} title - The title of the campaign to be created.
 * @param {string} goal - The goal or objective of the campaign.
 * @param {string} color - The color to be associated with the campaign (e.g., a hex code).
 * @param {string} startAt - The start date and time of the campaign in ISO 8601 format (e.g., '2023-10-26T10:00:00.000Z').
 * @param {string} endAt - The end date and time of the campaign in ISO 8601 format (e.g., '2023-11-30T17:00:00.000Z').
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after creating the campaign.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught and returned within the promise).
 */
const createCampaign = async (sbAuthKey, title, goal, color, startAt, endAt) => {
    const url = 'https://app.staffbase.com/api/campaigns';

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json;charset=utf-8'
    };

    const payload = {
        title,
        goal,
        color,
        startAt,
        endAt
    }

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

/**
 * @async
 * @function assignCampaignToPost
 * @description Assigns a specific campaign to an existing Staffbase post.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string} postId - The unique identifier of the Staffbase post to which the campaign will be assigned.
 * @param {string} campaignId - The unique identifier of the Staffbase campaign to be assigned to the post.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after assigning the campaign.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.put` call fails (though this is caught and returned within the promise).
 */
const assignCampaignToPost = async (sbAuthKey, postId, campaignId) => {
    const url = `https://app.staffbase.com/api/posts/${postId}`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        campaignId
    }

    try {
        const response = await axios.put(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }
}

/**
 * @async
 * @function getBranchChannels
 * @description Retrieves a list of branch channels from the Staffbase API.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the branch channel data returned by the Staffbase API.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.get` call fails (though this is caught and returned within the promise).
 */
const getBranchChannels = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/branch/channels';

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

/**
 * @async
 * @function getChannelPosts
 * @description Retrieves a list of 40 posts from a specific Staffbase channel.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string} channelID - The unique identifier of the Staffbase channel from which to retrieve posts.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the post data returned by the Staffbase API for the specified channel.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.get` call fails (though this is caught and returned within the promise).
 */
const getChannelPosts = async (sbAuthKey, channelID) => {
    const url = `https://app.staffbase.com/api/channels/${channelID}/posts?limit=50`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

/**
 * @async
 * @function generateCampaignData
 * @description Asynchronously generates campaign data (titles, descriptions, and associated post titles) using the Gemini API.
 * It determines whether to create new campaigns or associate provided post titles with existing campaigns
 * based on the presence of a `campaignsDictionary`.
 * @param {object | undefined} campaignsDictionary - An optional dictionary (object) containing existing campaign data.
 * If `undefined`, the function will generate entirely new campaigns.
 * @param {string} postTitles - A string containing a list of post titles that need to be organized into campaigns.
 * Each title should ideally be on a new line for better processing within the prompt.
 * @param {string} [campaignTitles=''] - An optional string containing a list of existing campaign titles.
 * This is only used when `campaignsDictionary` is defined, providing context
 * for potentially associating new posts with existing campaigns.
 * @returns {Promise<{ success: boolean, data: object | Error }>} - A promise that resolves to an object indicating the success status
 * and the generated campaign data or an error object if something went wrong.
 * The data structure varies based on whether new campaigns are created
 * or existing ones are used.
 * - If `campaignsDictionary` is `undefined`:
 * ```json
 * {
 * "[Campaign Title]": {
 * "Description": "[Campaign Description]",
 * "Posts to add": [Title ID Number, ...]
 * },
 * ...
 * }
 * ```
 * - If `campaignsDictionary` is defined:
 * ```json
 * {
 * "Existing Campaigns": {
 * "[Existing Campaign Title]": [Title ID Number, ...],
 * ...
 * },
 * "New Campaigns": {
 * "[New Campaign Title]": {
 * "Description": "[Campaign Description]",
 * "Posts to add": [Title ID Number, ...]
 * },
 * ...
 * }
 * }
 * ```
 */
const generateCampaignData = async (campaignsDictionary, postTitles, campaignTitles = '') => {
    //gemini api initialization
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
    let result = undefined;

    //context for prompt providing understanding on what Staffbase Campaigns are
    const context = `
     I am looking to create a Staffbase Campaign. A Staffbase Campaign is a way to set, track, and analyze your strategic content goals for internal communications. 
     Here are some examples of Campaigns
     
     Campaign 1
     Title: Change Management
     Description: Empowering our team to embrace change, drive innovation, and achieve success together by fostering adaptability, collaboration, and continuous growth.

     Campaign 2
     Title: Company Values
     Description: Raise awareness of ongoing health and safety changes due to the pandemic and ensure our workforce is informed.

     Campaign 3
     Title: Connect Sustainability
     Description: Connect Carbon 0 is an initiative launched in 2024 to lower our carbon footprint. Objective: be recognized as industry leader in 2025

     Campaign 4
     Title: Employer Branding & Community
     Description: Measuring effectiveness of Employer branding & Community initiatives at Connect. This Campaign is directly linked to our Employer of the Year Key Results owned by our People Division.

     Campaign 5
     Title: IT Security
     Description: Reduce the phishing email attempt - Raise awareness for employees in next surveys > 60%

     Campaign 6
     Title: Leadership visibility

     Campaign 7
     Title: Mission and Brand
     Description: We want to encourage engagement and action aligned with Company goals.
 `;

    try {
        //if no campaigns exist in env, feed no campaign specific prompt
        if (campaignsDictionary === undefined) {
            const noCampaignsPrompt = `
                ${context}

                Based on the below content titles can you create a list of at most 10 (less than 10 is acceptable) Campaign titles and descriptions and organize what title goes to what campaign. Please make sure each campaign has at least 3 titles associated with it. The Campaign Description should be no more than 120 characters.

                Titles:

                ${postTitles}
                Return your result in JSON in the following structure:
                {
                    [Replace with Campaign Title]: {
                        Description: [Replace with Campaign Description],
                        Posts to add: [Replace with array of Title ID Numbers for Campaign]
                    }
                }
            `
            result = await model.generateContent(noCampaignsPrompt);
        }

        //if campaigns exist in env, feed campaign specific prompt
        else {
            const campaignsDoExistPrompt = `
                ${context}

                Based on the below content titles, can you decide if any of the titles should be a part of the following campaign titles: 
                
                Campaign Titles:
                ${campaignTitles}
                If any of them do not, create any number of campaigns you see fit with a campaign title and campaign description that you think are needed and organize the content titles that should be aprt of that campaign to the correct campaign. Each created campaign should have at least three content titles associated with it.  Please do not include any campaigns with no content titles associated with it. The Campaign Description should be no more than 120 characters.

                Content Titles:

                ${postTitles}

                Return your result in JSON in the following structure:
                {
                    Existing Campaigns: {
                        [Replace with Existing Campaign Title]: [Replace with array of Title ID Numbers for Campaign]
                    },
                    New Campaigns: {
                        [Replace with New Campaign Title]: {
                            Description: [Replace with Campaign Description],
                            Posts to add: [Replace with array of Title ID Numbers for Campaign]
                        }
                    }
                }
        `
            result = await model.generateContent(campaignsDoExistPrompt);
        }

        return { success: true, data: result }
    } catch (error) {
        return { success: false, data: error }
    }

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

/**
 * @function campaignsInstallation
 * @description designed to automatically create and populate Staffbase campaigns based on the titles of existing, 
 * unassigned news posts, leveraging the Gemini AI model for grouping and description generation.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @returns {responseBody}
 *
 */
export const campaignsInstallation = async (sbAuthKey) => {
    //response body to return to client
    const responseBody = {
        "success": {},
        errors: {}
    }

    /*** 1. check to see if there are campigns. If yes, store the names and ids***/
    const campaigns = await getCampaigns(sbAuthKey);
    if (!campaigns.success) {
        responseBody['errors']['Campaign Get Error'] = 'Error getting campaigns';
        return responseBody;
    }

    //this will be used to store (campaign name: campaign id). we will use this later to for assigning post to the correct campaign
    let campaignsDictionary = undefined;
    // will be used to store a large string of all existing campaign titles. This will be used later to feed to gemini
    let campaignTitles = '';

    if (campaigns.data.total > 0) {
        campaignsDictionary = {};
        for (const campaign of campaigns.data.data) {
            campaignsDictionary[campaign.title] = campaign.id;
            campaignTitles = campaignTitles + `${campaign.title}\n\n`;
        }
    }

    /*** 2. get news content that is not assigned to a campaign already***/

    //get all news(article,updates) channels
    const branchChannels = await getBranchChannels(sbAuthKey);
    if (!branchChannels.success) {
        responseBody['errors']['Branch Channel Get Error'] = 'Error getting branch channels. Please try again, if issue persist please reach out to manager of this script';
    }

    //loop through every available news channel and look through the channels post
    //for each post, check to see if it is already apart of a campaign, if not save it
    if (branchChannels.data.total > 0) {
        //titlesDictionary (function specific id (postCounter): post title)
        const titlesDictionary = {};
        //titlesDictionary (function specific id (postCounter): post id)
        const titlesDictionaryToID = {};
        //the title string keeps a running list of post titles and attaches a title id to it (postCounter)
        let titles = '';
        //postCounter functions as both a counter for the loop and the unique id to help us map the correct post to the correct campaign
        let postCounter = 0;

        for (const channel of branchChannels.data.data) {
            if (channel.contentType = 'articles') {
                //get posts from channel
                const channelPosts = await getChannelPosts(sbAuthKey, channel.id);
                if (!channelPosts.success) {
                    responseBody['errors'][`Error getting posts from channel ID:`] = channelPosts.id
                    continue;
                }
                //if posts exists, loop through it
                if (channelPosts.data.data.length > 0) {
                    //the number of posts we loop through depends on the number of posts in that channel.
                    //if the channel has more that 10 posts, only count through half of the channels total posts.
                    const channelLoopCount = channelPosts.data.data.length;
                    for (let x = 0; x <= channelLoopCount - 1; x++) {
                        const channelPost = channelPosts.data.data[x];
                        //if the post does not have a campaign Id, first try to save the english title. if there is not a english title, save the first available language title
                        //lastly, titles will be saved into both dictionarys and title strings
                        if (!channelPost['campaignId']) {
                            const channelContentLanguages = Object.keys(channelPost['contents']);
                            if (channelContentLanguages.includes('en_US')) {
                                titlesDictionary[postCounter] = channelPost['contents']['en_US'].title;
                            }
                            else {
                                titlesDictionary[postCounter] = channelPost['contents'][channelContentLanguages[0]].title;
                            }
                            titlesDictionaryToID[postCounter] = channelPost.id;
                            titles = titles + `Title ID Number ${postCounter++} \n` + channelPost['contents']['en_US'].title + '\n\n';
                        }
                    }
                }
            }
        }

        // If no unassigned posts are found, return an error message indicating this.
        if (titles === '') {
            return `ERROR: There are no available posts to work with to add to campaigns. If there are no campaigns in your environment, please run this script again and reach out to manager of this script if this issue persist. If campaigns already exist in your env, this issue is mostly likely caused by there being no more available posts. In other words, all posts the script is designed to look at already has a campaign associated with it. Try adding new content (make sure it is published) or deleting all or some of your existing campaigns.`;
        }

        /*** 3. leverage gemini to create campaigns data ***/
        let result = undefined;

        //generate campaign data
        const campaignData = await generateCampaignData(campaignsDictionary, titles, campaignTitles);
        if (campaignData.success) {
            result = campaignData.data;
        } else {
            responseBody['errors'][`Gemini Request Error`] = 'There was a error in the Gemini Request. Please run this script again. If issue persists, please reach out to manager of the script.'
            return responseBody;
        }

        /*** 4. add campaign data to env ***/
        if (result != undefined) {
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
                responseBody['errors'][`Gemini JSON Return Error`] = 'Gemini did not return what we needed to generate campaigns. Please run this script again. If issue persist, please reach out to manager of the script.'
                return responseBody;
            }
            // Set the start date for new campaigns to the current date.
            const startAt = new Date().toISOString();
            let endAt = new Date();
            // Set the end date for new campaigns to one year from the current date.
            endAt.setFullYear(endAt.getFullYear() + 1);
            endAt = endAt.toISOString();
            // Array of predefined colors to be assigned to newly created campaigns. This will be picked at random later.
            const campaignColors = ['#006cff', '#1d8713', '#d9380a', '#090d48', '#b22d5b', '#207d9f', '#974fe1']

            // Handle the case where the Staffbase env already has existing campaigns. In this situation, we will add posts to existing campaigns and/or creating new campaigns and adding posts to it.
            if (jsonResult["Existing Campaigns"] && jsonResult["New Campaigns"]) {

                //get keys of the existing campaigns from Gemini JSON Result
                const existingCampaigns = Object.keys(jsonResult["Existing Campaigns"]);
                //get keys of the new campaigns from Gemini JSON Result
                const newCampaigns = Object.keys(jsonResult["New Campaigns"]);

                //loop through what we got returned for our existing campaigns, if anything, and add the posts to the campaign
                if (existingCampaigns.length > 0) {
                    //loop through existing campaigns
                    const existingCampaignPromises = existingCampaigns.map(async existingCampaign => {
                        //get id of the campaign we save earlier
                        const existingCampaignID = campaignsDictionary[existingCampaign];
                        //get the array of posts that will be added
                        const existingCampaignPostArr = jsonResult["Existing Campaigns"][existingCampaign];

                        //loop through posts arr and assign each post to existing campaign it belongs to
                        if (Array.isArray(existingCampaignPostArr) && existingCampaignPostArr.length > 0) {
                            let successCount = 0;
                            const campaignAddPromises = existingCampaignPostArr.map(async existingCampaignPost => {
                                // Assign the campaign to the post using the stored post ID and campaign ID.
                                const addToCampaign = await assignCampaignToPost(sbAuthKey, titlesDictionaryToID[existingCampaignPost], existingCampaignID);
                                if (!addToCampaign.success) {
                                    responseBody['errors'][`Error adding to existing campaign ${existingCampaign}`] = 'Issue adding to campaign';
                                    return; //skip loop iteration
                                }
                                successCount++;
                            });
                            await Promise.all(campaignAddPromises);
                            responseBody['success'][existingCampaign] = successCount;

                        } else {
                            responseBody['errors'][`Gemini JSON Misconfigured`] = 'Gemini did not return what we needed to generate campaigns. Please run this script again. If issue persist, please reach out to manager of the script.'
                            return; //skip loop iteration
                        }
                    });
                    await Promise.all(existingCampaignPromises);
                }
                //loop through new campaigns
                if (newCampaigns.length > 0) {
                    const newCampaignPromises = newCampaigns.map(async newCampaign => {
                        // Randomly select a color for the new campaign.
                        const campaignColor = campaignColors[Math.floor(Math.random() * campaignColors.length)];
                        // Get the details for the new campaign from the Gemini response.
                        const newCampaignObject = jsonResult["New Campaigns"][newCampaign];
                        if (typeof newCampaignObject === "object" && newCampaignObject["Description"] && newCampaignObject["Posts to add"] && Array.isArray(newCampaignObject["Posts to add"])) {
                            //create new campaign
                            const createdCampaign = await createCampaign(sbAuthKey, newCampaign, newCampaignObject["Description"], campaignColor, startAt, endAt);
                            if (!createdCampaign.success) {
                                responseBody['errors'][`Error creating ${newCampaign}`] = 'There was a error creating a new campaign';
                                return;
                            }
                            const createdCampaignId = createdCampaign.data.id;
                            let successCount = 0;
                            // Loop through the post IDs that Gemini suggested adding to this new campaign.
                            const newCampaignAddedPostPromises = newCampaignObject["Posts to add"].map(async postID => {
                                // Assign the campaign to the post using the stored post ID and the new campaign ID.
                                const addToCampaign = await assignCampaignToPost(sbAuthKey, titlesDictionaryToID[postID], createdCampaignId);
                                if (!addToCampaign.success) {
                                    responseBody['errors'][`Error adding to new campaign ${newCampaign}`] = 'Issue adding to campaign';
                                    return; //skip loop iteration
                                }
                                successCount++;
                            });
                            await Promise.all(newCampaignAddedPostPromises);
                            responseBody['success'][newCampaign] = successCount;
                        }
                    })
                    await Promise.all(newCampaignPromises);
                }
            }
            // Handle the case where the Staffbase env in question has no campaigns. In this situation, we will only be creating new campaigns.
            else {
                // Get the keys (campaign names) from the Gemini response.
                const newCampaigns = Object.keys(jsonResult);
                // Loop through the campaigns suggested by Gemini and create them with the corresponding posts.
                if (newCampaigns.length > 0) {
                    const campaignPromises = newCampaigns.map(async campaign => {
                        // Randomly select a color for the new campaign.
                        const campaignColor = campaignColors[Math.floor(Math.random() * campaignColors.length)];
                        // Check if the campaign object has the expected structure (Description and Posts to add).
                        if (typeof jsonResult[campaign] === "object" && jsonResult[campaign]["Description"] && jsonResult[campaign]["Posts to add"] && Array.isArray(jsonResult[campaign]["Posts to add"])) {
                            const newCampaignObject = jsonResult[campaign];
                            // Create the new campaign.
                            const createdCampaign = await createCampaign(sbAuthKey, campaign, newCampaignObject["Description"], campaignColor, startAt, endAt);
                            if (!createdCampaign.success) {
                                responseBody['errors'][`Error creating ${campaign}`] = 'There was a error creating a new campaign';
                                return; // Skip the current iteration if campaign creation fails.
                            }
                            // Get the ID of the newly created campaign.
                            const createdCampaignId = createdCampaign.data.id;
                            let successCount = 0;
                            // Loop through the post IDs that Gemini suggested adding to this new campaign.
                            const newCampaignAddedPostPromises = newCampaignObject["Posts to add"].map(async postID => {
                                // Assign the campaign to the post using the stored post ID and the new campaign ID.
                                const addToCampaign = await assignCampaignToPost(sbAuthKey, titlesDictionaryToID[postID], createdCampaignId);
                                if (!addToCampaign.success) {
                                    responseBody['errors'][`Error adding to new campaign ${campaign}`] = 'Issue adding to campaign';
                                    return; // Skip the current iteration if there's an error.
                                }
                                successCount++;
                            });
                            await Promise.all(newCampaignAddedPostPromises);
                            responseBody['success'][campaign] = successCount;
                        }
                    })
                    await Promise.all(campaignPromises);
                }
            }

        }

    }
    return responseBody;
}