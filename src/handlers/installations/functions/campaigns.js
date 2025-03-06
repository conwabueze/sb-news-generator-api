import axios from 'axios';

const getCampaigns = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/campaigns';

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
    //check to see if there are campigns. If yes, store the names and ids
    const campaigns = await getCampaigns();
    //if not, proceed

    //get all news(article) channels
    const branchChannels = await getBranchChannels(sbAuthKey);
    if(!branchChannels.success){
        return 'Error getting branch channels. Please try again, if issue persist please reach out to manager of this script';
    }
    if(branchChannels.data.total > 0){
        //loop through channesl to find news channels
        for(const channel of branchChannels.data.data){
       
                //get posts from channel
                const channelPosts = await getChannelPosts(sbAuthKey,channel.id);
                if(!channelPosts.success){
                    console.log('Error getting posts from channel');
                    continue;
                }
                //if posts exists, loop through half of the channels posts and saves the posts content
                if(channelPosts.data.total > 0){
                    //console.log(channelPosts.data);
                    const channelLoopCount = Math.ceil(channelPosts.data.total / 2); 
                    console.log(`Total ${channelPosts.data.total}, ${channel.id} and Count is ${channelLoopCount}`);
                    //for(let x = 0; x<=channelPosts.data.total%2)
                    //console.log(channelPosts.data);
                }
                
        }
        //get post for that channels and loops through only half of it
        //get post to news object or string (directory) of news article
        //once done ask gemini to create campaigns off of them or add them to exisiting campaigns 

    }
    //const articleChannelIDs = bChannels.data.data.map(channel)
    //console.log(branchChannels.data);
}