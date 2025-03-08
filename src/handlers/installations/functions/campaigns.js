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
    };

    const payload = {
        title,
        goal,
        color,
        startAt,
        endAt
    }

    try {
        const response = await axios.post(url, { headers });
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
        let titles = '';
        //loop through every available news channel
        let postCounter = 0;
        for (const channel of branchChannels.data.data) {
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
                const channelLoopCount = channelPosts.data.total > 8 ? Math.ceil(channelPosts.data.total / 2) : channelPosts.data.total;
                //console.log(channelLoopCount);
                //console.log(`Total ${channelPosts.data.total}, ${channel.id} and Count is ${channelLoopCount}`);
                for (let x = 0; x <= channelLoopCount - 1; x++) {
                    const channelPost = channelPosts.data.data[x];
                    if (!channelPost['campaignId']) {
                        const channelContentLanguages = Object.keys(channelPost['contents']);
                        if (channelContentLanguages.includes('en_US')) {
                            titlesDictionary[postCounter++] = channelPost['contents']['en_US'].title;
                            titles = titles + `title ${postCounter} \n` + channelPost['contents']['en_US'].title + '\n\n';
                        }
                        else
                            titlesDictionary[x] = channelPost['contents'][channelContentLanguages[0]].title;
                        //console.log(channelContentLanguages);
                        //console.log(channelPost);
                    }
                    //console.log(channelPosts.data.data[x]);
                }
                //console.log(channelPosts.data);

            }

        }
        //console.log(campaignsDictionary);
        console.log(titles);
        console.log(titlesDictionary);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        let result = undefined;

        if (campaignsDictionary === undefined) {
            const prompt = `
        I am looking to create a Staffbase Campaign. A Staffbase Campaign is a way to set, track, and analyze your strategic content goals for internal communications. 
        Based on the following content titles can you create a list of at least 3 Campaign titles and descriptions and organize what title goes to what campaign. The Campaign Description should be no more than 120 characters.

        Titles:

        ${titles}

        Return your result in JSON in the following structure:
        {
            [Replace with Campaign Title]: {
                Description: [Replace with Campaign Description],
                Original Title: [Replace with Content Title Number]
            }
        }
        `
            result = await model.generateContent(prompt);
        }else{
            const prompt = `
        I am looking to create or add to an existing Staffbase Campaign. A Staffbase Campaign is a way to set, track, and analyze your strategic content goals for internal communications. 
        Based on the following content titles can you decide if any of the titles should be a part of the following campaigns: 

        ${campaignTitles}
        If any of them do not, can you create any number of campaigns with a campaign title and campaign description that you think are needed and organize the content's title to the correct campaign. The Campaign Description should be no more than 120 characters.

        Titles:

        ${titles}

        Return your result in JSON in the following structure:
        {
            Existing Campaigns: {
                [Replace with Existing Title]: [Replace with array of Content Title Numbers]
            },
            News Campaigns: {
                [Replace with New Campaign Title]: {
                    Description: [Replace with Campaign Description],
                    Original Title: [Replace with Content Title Number]
                }
            }
        }
        `
        result = await model.generateContent(prompt);
        }
        if (result != undefined) {
            let jsonResult = result.response.text();
            console.log(jsonResult);
            if (jsonResult.indexOf("json") !== -1 && jsonResult.indexOf("```") !== -1) {
                const jsonRegex = /```json\n([\s\S]*?)\n```/;
                const match = jsonResult.match(jsonRegex);
                jsonResult = match[1].trim();
                jsonResult = JSON.parse(jsonResult);
                const campaignNames = Object.keys(jsonResult);
                const startAt = new Date().toISOString();
                let endAt = new Date();
                endAt.setFullYear(endAt.getFullYear() + 1);
                endAt = endAt.toISOString();
                console.log(startAt);
                console.log(endAt);
                console.log(campaignNames);
                const campaignColors = ['#207D9F']
            }
        }

        //get post for that channels and loops through only half of it
        //get post to news object or string (directory) of news article
        //once done ask gemini to create campaigns off of them or add them to exisiting campaigns 

    }
    //const articleChannelIDs = bChannels.data.data.map(channel)
    //console.log(branchChannels.data);
}