import axios from 'axios';

export const getSBNewsChannel = async (authKey, channelID) => {

    const url = `https://app.staffbase.com/api/channels/${channelID}`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        const data = response.data;
        return { success: true, data };
    } catch (error) {
        return { success: false, error };
    }


}

export const createSBNewsChannel = async (authKey, channelName, accessorIDs = []) => {

    const url = 'https://app.staffbase.com/api/installations';

    const data = {
        "pluginID": "news",
        "config": {
            "localization": {
                "en_US": {
                    "title": `${channelName}`, "description": null
                }
            },
            showAdminActions: true,
            showPageBackground: true,
            sidebarVisible: true
        },
        "commentingAllowed": true,
        "commentingEnabledDefault": true,
        "likingAllowed": true,
        "likingEnabledDefault": true,
        "acknowledgingAllowed": true,
        "acknowledgingEnabledDefault": false,
        "highlightingAllowed": true,
        "highlightingEnabledDefault": false,
        "internalSharingAllowed": false,
        "externalSharingAllowed": false,
        "internalSharingEnabledDefault": false,
        "externalSharingEnabledDefault": false,
        "notificationChannelsAllowed": ["email", "push"],
        "notificationChannelsDefault": ["email", "push"],
        "contentType": "articles",
        "visibleInPublicArea": false,
        "accessorIDs": accessorIDs //you need this to have for all users visibility
    };

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(url, data, { headers });
        return { success: true, data: response.data.id };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, data: error };

    }


}

export const deleteSBNewsChannel = async (authKey, channelID) => {

    const url = `https://app.staffbase.com/api/installations/${channelID}`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.delete(url, { headers });
        return { success: true, data: response.data.id };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, data: error };
    }


}

export const publishSBNewsChannel = async (authKey, channelID) => {
    const url = `https://app.staffbase.com/api/installations/${channelID}/publish`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    const data = {};

    try {
        const response = await axios.post(url, {}, { headers });
        return { success: true };

    } catch (error) {
        return { success: false, data: error };
    }
}

export const unpublishSBNewsChannel = async (authKey, channelID) => {
    const url = `https://app.staffbase.com/api/installations/${channelID}/unpublish`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    const data = {};

    try {
        const response = await axios.post(url, {}, { headers });

    } catch (error) {
        console.error('Error:', error);
    }
}

export const getSBNewsChannels = async (authKey) => {
    const url = `https://app.staffbase.com/api/channels`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    const data = {};

    try {
        const response = await axios.get(url, { headers });
        const channels = response.data.data;
        //console.log(channels);
        const channelIDs = channels.map((channel) => channel.id);
        return channelIDs;
    } catch (error) {
        console.error('Error:', error);
    }
}

export const getSBNewsChannelsBranch = async (authKey) => {
    const url = `https://app.staffbase.com/api/branch/channels?limit=100`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    const data = {};

    try {
        const response = await axios.get(url, { headers });
        const data = response.data.data;
        return { success: true, data }
        //console.log(channels);
        // const channelIDs = channels.map((channel) => channel.id);
        // return channelIDs;
    } catch (error) {
        return { success: false, error };
    }
}

export const getSBPage = async (authKey, pageID) => {
    const url = `https://app.staffbase.com/api/pages/${pageID}`;
    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    const data = {};

    try {
        const response = await axios.get(url, { headers });
        const page = response.data;
        return page;
    } catch (error) {
        console.error('Error:', error);
    }

}

export const getSBSpaces = async (authKey) => {
    const url = `https://app.staffbase.com/api/spaces`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    const data = {};

    try {
        const response = await axios.get(url, { headers });
        const data = response.data.data;
        return { success: true, data };
    } catch (error) {
        return { success: false, error };
    }
}

export const getSBUsers = async (authKey) => {
    const url = 'https://app.staffbase.com/api/users?';

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        const data = response.data.data;
        return { success: true, data };
    } catch (error) {
        return { success: false, error };
    }

}