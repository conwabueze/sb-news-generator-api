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
/**
* Asynchronously retrieves the menu structure for a specific space within the Staffbase platform.
*
* @async
* @function getMenu
* @param {string} sbAuthKey - The Staffbase API authentication key (base64 encoded).
* @param {string} accessorIds - The ID of the space (e.g., a plant or location) for which to retrieve the menu.
* @returns {Promise<{success: boolean, data: object|Error}>} - A promise that resolves to an object.
* The object contains a `success` boolean indicating if the request was successful,
* and a `data` property which holds either the menu data (if successful) or the error object (if failed).
*/
const getMenu = async (sbAuthKey, accessorIds) => {
    const url = `https://app.staffbase.com/api/spaces/${accessorIds}/menu`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json;charset=utf-8'
    };

    try {
        const response = await axios.get(url, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}
export const getAllNewPages = async (authKey, accessorIds, lookingFor) => {
    const returnObject = {}
    // Fetch the current menu structure for the specified Staffbase space.
    const menu = await getMenu(authKey, accessorIds);
    if (!menu.success) {
        return 'Issue fetching menu. Please try again. If problem persist, please reach out to manager of Script';
    }
    // Access the top-level menu items from the fetched menu data.
    let menuItems = menu.data.children;

    //if there are actual menu items
    if (menuItems["total"] > 0) {
        //Search top level menu for any news pages that match lookingFor
        menuItems.data.forEach(item => {
            //check to see if menu item is a newpage
            if(item.hasOwnProperty("restrictedPluginID") && item["restrictedPluginID"] === 'news'){
                //iterate through configuration localization language titles to see if any of the titles match lookingFor
                //In other words each news page might have several different language titles. Sometimes someone creates a news page with a english title under spanish, so it is best to check everything.
                const localizationKeys = Object.keys(item.config.localization);
                console.log(localizationKeys)
                localizationKeys.forEach(languageKey => {
                    const currentItemLocalization = item.config.localization[languageKey];
                    if(lookingFor.includes(currentItemLocalization.title))
                        returnObject[currentItemLocalization.title] = item.id;
                });
            }
        })
       
    }

    console.log(returnObject);
}