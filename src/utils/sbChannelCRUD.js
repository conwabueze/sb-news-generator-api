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

export const createSBNewsChannel = async (authKey, channelName, accessorIDs = [], adminIDs = '', contentType = 'articles') => {

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
        "contentType": contentType,
        "visibleInPublicArea": false,
        "accessorIDs": accessorIDs //you need this to have for all users visibility
    };

    if (adminIDs !== '')
        data["adminIDs"] = adminIDs

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

export const updateSBNewsChannel = async (authKey, channelName, channelID, accessorIDs = [], menuFolderIDs = '') => {

    const url = `https://app.staffbase.com/api/installations/${channelID}`;

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

    if (menuFolderIDs !== '')
        data["menuFolderIDs"] = menuFolderIDs;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(url, data, { headers });
        return { success: true, data: response.data.id };
    } catch (error) {
        //console.error('Error:', error);
        return { success: false, data: error };

    }


}

export const addNewsPageToSBNewsChannel = async (sbAuthKey, accessorIds, newspageId ,channelId) => {
    const url = `https://app.staffbase.com/api/spaces/${accessorIds}/menu`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    const data = [
        {
            "op": "add",
            "path": `/${newspageId}/0`,
            "value": {
                "installationID": channelId,
                "nodeType": "installation",
                "pluginID": "news"
            }
        }
    ]

    try {
        const response = await axios.patch(url, data, { headers });
        return { success: true, data: response.data };
    } catch (error) {
        //console.error('Error:', error);
        return { success: false, data: error };

    }
}

export const addNewsPageToSBNewsChannelWithRetry = async (
    sbAuthKey,
    accessorIds,
    newspageId,
    channelId,
    maxRetries = 5, // Set a maximum number of retries
    retryDelayMs = 2000 // Set a delay between retries in milliseconds
  ) => {
    let retries = 0;
    let result = { success: false };
  
    while (!result.success && retries < maxRetries) {
      try {
        const url = `https://app.staffbase.com/api/spaces/${accessorIds}/menu`;
        const headers = {
          'Authorization': `Basic ${sbAuthKey}`,
          'Content-Type': 'application/json',
        };
        const data = [
          {
            op: 'add',
            path: `/${newspageId}/0`,
            value: {
              installationID: channelId,
              nodeType: 'installation',
              pluginID: 'news',
            },
          },
        ];
  
        const response = await axios.patch(url, data, { headers });
        result = { success: true, data: response.data };
        return result; // If successful, exit the loop and return
      } catch (error) {
        console.error(`Attempt ${retries + 1} failed:`, error);
        result = { success: false, data: error };
        retries++;
        if (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
      }
    }
  
    console.error(`Failed after ${maxRetries} attempts.`);
    return result; // Return the final (failed) result if max retries are reached
  };

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

const getNestedMenu = async (sbAuthKey, accessorIds, nestedMenuId) => {
    const url = `https://app.staffbase.com/api/spaces/${accessorIds}/menu/${nestedMenuId}`;

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

const getNestedMenuNewsPages = async (sbAuthKey, accessorIds, nestedMenuId, lookingFor, returnObject) => {
    const menu = await getNestedMenu(sbAuthKey, accessorIds, nestedMenuId); //nested menu
    if (!menu.success) {
        return { success: false, error: 'Issue fetching menu. Please try again. If problem persist, please reach out to manager of Script' }
    }

    // Access the top-level menu items from the fetched menu data.
    let menuItems = menu.data.children;

    //if there are actual menu items
    if (menuItems["total"] > 0) {
        //Search top level menu for any news pages that match lookingFor
        const menuItemsLookThrough = menuItems.data.map(async item => {
            //check to see if menu item is a newpage
            if (item.hasOwnProperty("restrictedPluginID") && item["restrictedPluginID"] === 'news') {
                //iterate through configuration localization language titles to see if any of the titles match lookingFor
                //In other words each news page might have several different language titles. Sometimes someone creates a news page with a english title under spanish, so it is best to check everything.
                const localizationKeys = Object.keys(item.config.localization);
                localizationKeys.forEach(languageKey => {
                    const currentItemLocalization = item.config.localization[languageKey];
                    if (lookingFor.some(menuItemToLookFor => menuItemToLookFor === currentItemLocalization.title)) {
                        returnObject[currentItemLocalization.title] = item.id;
                    }
                });
            }

            //if we are not dealing with a news page, check if we are dealing with a folder.
            //if it is a folder, we should check the folder items for any news pages and save that into the reponse body
            if (item.hasOwnProperty("children") && item["children"]["total"] > 0) {
                const nestedMenuNewsPages = await getNestedMenuNewsPages(sbAuthKey, accessorIds, item.id, lookingFor, returnObject);
            }
        });
        await Promise.all(menuItemsLookThrough);
    }

}

export const getAllNewPages = async (sbAuthKey, accessorIds, lookingFor) => {
    const returnObject = {}
    // Fetch the current menu structure for the specified Staffbase space.
    const menu = await getMenu(sbAuthKey, accessorIds);
    if (!menu.success) {
        return { success: false, error: 'Issue fetching menu. Please try again. If problem persist, please reach out to manager of Script' }
    }
    // Access the top-level menu items from the fetched menu data.
    let menuItems = menu.data.children;

    //if there are actual menu items
    if (menuItems["total"] > 0) {
        //Search top level menu for any news pages that match lookingFor
        const menuItemsLookThrough = menuItems.data.map(async item => {
            //check to see if menu item is a newpage
            if (item.hasOwnProperty("restrictedPluginID") && item["restrictedPluginID"] === 'news') {
                //iterate through configuration localization language titles to see if any of the titles match lookingFor
                //In other words each news page might have several different language titles. Sometimes someone creates a news page with a english title under spanish, so it is best to check everything.
                const localizationKeys = Object.keys(item.config.localization);
                localizationKeys.forEach(languageKey => {
                    const currentItemLocalization = item.config.localization[languageKey];
                    if (lookingFor.some(menuItemToLookFor => menuItemToLookFor === currentItemLocalization.title)) {
                        returnObject[currentItemLocalization.title] = item.id;
                    }
                });
            }

            //if we are not dealing with a news page, check if we are dealing with a folder.
            //if it is a folder, we should check the folder items for any news pages and save that into the reponse body
            if (item.hasOwnProperty("children") && item["children"]["total"] > 0) {
                const nestedMenuNewsPages = await getNestedMenuNewsPages(sbAuthKey, accessorIds, item.id, lookingFor, returnObject);
            }
        });
        await Promise.all(menuItemsLookThrough);
    }

    return { success: true, data: returnObject };
}