import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

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

const putToCampaign = async (sbAuthKey, postId, campaignId) => {
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

const getChannelPosts = async (sbAuthKey, channelID) => {
    const url = `https://app.staffbase.com/api/channels/${channelID}/posts`;

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

//Create campaigns and assign articles
//Not all articles will be used but only half of each article channel
export const campaignsInstallation = async (sbAuthKey) => {
    const responseBody = {
        "success": {},
        errors: {}
    }
    //check to see if there are campigns. If yes, store the names and ids
    const campaigns = await getCampaigns(sbAuthKey);
    if (!campaigns.success) {
        responseBody['errors']['Campaign Get Error'] = 'Error getting campaigns';
        return responseBody;
    }

    let campaignsDictionary = undefined;
    let campaignTitles = ''
    if (campaigns.data.total > 0) {
        campaignsDictionary = {};
        for (const campaign of campaigns.data.data) {
            campaignsDictionary[campaign.title] = campaign.id;
            campaignTitles = campaignTitles + `${campaign.title}\n\n`;
        }
    }

    //get all news(article,updates) channels
    const branchChannels = await getBranchChannels(sbAuthKey);
    if (!branchChannels.success) {
        responseBody['errors']['Branch Channel Get Error'] = 'Error getting branch channels. Please try again, if issue persist please reach out to manager of this script';
    }

    //loop through every available news channel and look through half of the available posts
    //for each post, check to see if it is already apart of a campaign, if not save it
    if (branchChannels.data.total > 0) {
        const titlesDictionary = {};
        const titlesDictionaryToID = {};
        let titles = '';
        //loop through every available news channel
        let postCounter = 0;
        for (const channel of branchChannels.data.data) {
            if (channel.contentType = 'articles') {
                //get posts from channel
                const channelPosts = await getChannelPosts(sbAuthKey, channel.id);
                if (!channelPosts.success) {
                    responseBody['errors'][`Error getting posts from channel ID:`] = channelPosts.id
                    continue;
                }
                //if posts exists, loop through half of the channels posts and saves post that are not apart of a campaign
                if (channelPosts.data.total > 0) {
                    //console.log(channelPosts);

                    //half post variable
                    const channelLoopCount = channelPosts.data.total > 10 ? Math.ceil(channelPosts.data.total / 2) : channelPosts.data.total;
                    //console.log(channelLoopCount);
                    //console.log(`Total ${channelPosts.data.total}, ${channel.id} and Count is ${channelLoopCount}`);
                    for (let x = 0; x <= channelLoopCount - 1; x++) {
                        const channelPost = channelPosts.data.data[x];
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
                        //console.log(channelPosts.data.data[x]);
                    }
                    //console.log(channelPosts.data);

                }
            }
        }
        // console.log(titlesDictionary);
        // console.log(titlesDictionaryToID);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        let result = undefined;

        if (campaignsDictionary === undefined) {
            const prompt = `
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

        Based on the below content titles can you create a list of at most 4 Campaign titles and descriptions and organize what title goes to what campaign. The Campaign Description should be no more than 120 characters.

        Titles:

        ${titles}

        Return your result in JSON in the following structure:
        {
            [Replace with Campaign Title]: {
                Description: [Replace with Campaign Description],
                Posts to add: [Replace with array of Title ID Numbers for Campaign]
            }
        }
        `
            result = await model.generateContent(prompt);
        } else {
            const prompt = `
        I am looking to create or add to an existing Staffbase Campaign. A Staffbase Campaign is a way to set, track, and analyze your strategic content goals for internal communications.
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

        Based on the below content titles can you decide if any of the titles should be a part of the following campaign titles: 
        
        Campaign Titles:
        ${campaignTitles}
        If any of them do not, can you create at most 3 campaigns with a campaign title and campaign description that you think are needed and organize the content's title to the correct campaign. The Campaign Description should be no more than 120 characters.

        Content Titles:

        ${titles}

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
            result = await model.generateContent(prompt);
        }

        if (result != undefined) {
            let jsonResult = result.response.text();
            console.log(jsonResult);
            //take string JSON result and convert to a usable object
            if (jsonResult.indexOf("json") !== -1 && jsonResult.indexOf("```") !== -1) {
                const jsonRegex = /```json\n([\s\S]*?)\n```/;
                const match = jsonResult.match(jsonRegex);
                jsonResult = match[1].trim();
                jsonResult = JSON.parse(jsonResult);
            } else {
                responseBody['errors'][`Gemini JSON Return Error`] = 'Gemini did not return what we needed to generate campaigns. Please run this script again. If issue persist, please reach out to manager of the script.'
                return responseBody;
            }

            const startAt = new Date().toISOString();
            let endAt = new Date();
            endAt.setFullYear(endAt.getFullYear() + 1);
            endAt = endAt.toISOString();
            const campaignColors = ['#006cff', '#1d8713', '#d9380a', '#090d48', '#b22d5b', '#207d9f', '#974fe1']
            const campaignColor = campaignColors[Math.floor(Math.random() * campaignColors.length)];
            //console.log(campaignColor);
            //console.log(jsonResult);
            //are we dealing with adding to a already existing env with campaigns?
            if (jsonResult["Existing Campaigns"] && jsonResult["New Campaigns"]) {
                //get keys of the existing campaigns from Gemini JSON Result
                const existingCampaigns = Object.keys(jsonResult["Existing Campaigns"]);
                //get keys of the new campaigns from Gemini JSON Result
                const newCampaigns = Object.keys(jsonResult["New Campaigns"]);

                //loop through what we got returned for our existing campaigns, if anything, and add the posts to the campaign
                if (existingCampaigns.length > 0) {
                    //loop through existing
                    existingCampaigns.forEach(async existingCampaign => {
                        //get id of the campaign we save earlier
                        const existingCampaignID = campaignsDictionary[existingCampaign];
                        //get the array of posts that will be added
                        const existingCampaignPostArr = jsonResult["Existing Campaigns"][existingCampaign];
                        //loop through posts arr and assign each post to existing campaign it belongs to
                        if (Array.isArray(existingCampaignPostArr) && existingCampaignPostArr.length > 0) {
                            let successCount = 0;
                            const campaignAddPromises = existingCampaignPostArr.map(async existingCampaignPost => {
                                const addToCampaign = await putToCampaign(sbAuthKey, titlesDictionaryToID[existingCampaignPost], existingCampaignID);
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
                    })
                }

                if (newCampaigns.length > 0) {
                    console.log('in here as well');
                    const newCampaignPromises = newCampaigns.map(async newCampaign => {
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
                            //loops through post
                            const newCampaignAddedPostPromises = newCampaignObject["Posts to add"].map(async postID => {
                                const addToCampaign = await putToCampaign(sbAuthKey, titlesDictionaryToID[postID], createdCampaignId);
                                if (!addToCampaign.success) {
                                    responseBody['errors'][`Error adding to new campaign ${newCampaign}`] = 'Issue adding to campaign';
                                    return; //skip loop iteration
                                }
                                successCount++;
                            });
                            await Promise.all(newCampaignAddedPostPromises);
                            responseBody['success'][newCampaign] = successCount;
                            // console.log(newCampaignObject["Posts to add"]);
                            // console.log(createdCampaignId);


                            //const campaignId = createCampaign.data.id;
                        }
                    })
                    await Promise.all(newCampaignPromises);
                }
            }
            else {
                //get keys of the new campaigns from Gemini JSON Result
                const newCampaigns = Object.keys(jsonResult);

                if (newCampaigns.length > 0) {
                    const campaignPromises = newCampaigns.map(async campaign => {
                        if(typeof jsonResult[campaign] === "object" && jsonResult[campaign]["Description"] && jsonResult[campaign]["Posts to add"] && Array.isArray(jsonResult[campaign]["Posts to add"])){
                            const newCampaignObject = jsonResult[campaign];
                            const createdCampaign = await createCampaign(sbAuthKey, campaign, newCampaignObject["Description"], campaignColor, startAt, endAt);
                            if (!createdCampaign.success) {
                                responseBody['errors'][`Error creating ${newCampaign}`] = 'There was a error creating a new campaign';
                                return;
                            }

                            const createdCampaignId = createdCampaign.data.id;
                            let successCount = 0;
                            //loops through post
                            const newCampaignAddedPostPromises = newCampaignObject["Posts to add"].map(async postID => {
                                const addToCampaign = await putToCampaign(sbAuthKey, titlesDictionaryToID[postID], createdCampaignId);
                                if (!addToCampaign.success) {
                                    responseBody['errors'][`Error adding to new campaign ${newCampaign}`] = 'Issue adding to campaign';
                                    return; //skip loop iteration
                                }
                                successCount++;
                            });
                            await Promise.all(newCampaignAddedPostPromises);
                            responseBody['success'][campaign] = successCount;
                        }
                    })
                }
            }

        }

        //get post for that channels and loops through only half of it
        //get post to news object or string (directory) of news article
        //once done ask gemini to create campaigns off of them or add them to exisiting campaigns 

    }
    //const articleChannelIDs = bChannels.data.data.map(channel)
    //console.log(branchChannels.data);
    return responseBody;
}