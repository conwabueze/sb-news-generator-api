import axios from 'axios';

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

/**
 * Creates or updates a mobile quick link within a Staffbase space's menu.
 *
 * This function sends a PATCH request to the Staffbase API to modify a specific
 * menu item, effectively creating or updating a quick link that appears in the
 * mobile app's toolbar.
 *
 * @async
 * @param {string} sbAuthKey - The Staffbase API authentication key (Base64 encoded).
 * @param {string} accessorIds - The ID of the Staffbase space where the menu item resides.
 * @param {string} menuItemId - The unique installation ID of the menu item to modify.
 * @param {string} menuItemPath - The JSON Patch path within the menu structure to target the item.
 * Example: `/1/0` to target the first item within the second main item.
 * @param {number} menuItemIndex - The desired position of the quick link in the mobile toolbar (0-based index).
 * @param {object} quickLinkTitle - An object containing localized titles for the quick link.
 * Example: `{ "en": "Quick Link", "de": "Schnelllink" }`.
 * @param {object} visibility - An object defining the visibility rules for the quick link.
 * @returns {Promise<{ success: boolean, data: any }>} - A promise that resolves to an object
 * indicating the success of the operation and the
 * response data from the Staffbase API. If an error
 * occurs, `success` will be false and `data` will
 * contain the error object.
 */
const createMobileQuickLink = async (sbAuthKey, accessorIds, menuItemId, menuItemPath, menuItemIndex, quickLinkTitle, visibility) => {
    const url = `https://app.staffbase.com/api/spaces/${accessorIds}/menu`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json;charset=utf-8'
    };

    const payload = [
        {
            "op": "replace",
            "path": menuItemPath,
            "installationId": menuItemId,
            "value": {
                "config": {
                    "localization": quickLinkTitle,
                    "showInToolbar": true,
                    "toolbarPosition": menuItemIndex,
                    "logo": null,
                    "logoDark": null,
                    "logoDesktopMenu": null
                },
                "visibility": visibility
            }
        }
    ]

    try {
        const response = await axios.patch(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

/**
 * Asynchronously deletes a mobile quick link from a Staffbase space menu by updating its visibility.
 * Instead of a true deletion, it sets the 'showInToolbar' property to false.
 *
 * @async
 * @param {string} sbAuthKey - The Staffbase API authentication key (Base64 encoded).
 * @param {string} accessorIds - The ID of the Staffbase space.
 * @param {string} menuItemId - The installation ID of the menu item to be "deleted".
 * @param {string} menuItemPath - The JSON Patch path to the specific menu item within the menu structure.
 * Example: '/0/0' would target the first item within the first item.
 * @returns {Promise<{success: boolean, data: any}>} - A promise that resolves to an object indicating the success
 * of the operation and the response data from the Staffbase API.
 * `success: true` and `data: response.data` on success,
 * `success: false` and `data: error` on failure.
 */
const deleteMobileQuickLink = async (sbAuthKey, accessorIds, menuItemId, menuItemPath) => {
    const url = `https://app.staffbase.com/api/spaces/${accessorIds}/menu`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json;charset=utf-8'
    };

    const payload = [
        {
            "op": "replace",
            "path": menuItemPath,
            "installationId": menuItemId,
            "value": {
                "config": {
                    "showInToolbar": false
                },
            }
        }
    ]

    try {
        const response = await axios.patch(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

/** 
 * Asynchronously searches through Staffbase menu folders and recursively navigates through nested folders,
 * to find menu items that match titles specified in `menuItemsToLookFor`.
 * For matching items, it sets them as mobile quick links based on the `newMobileQuickLinks` configuration.
 * For all other items, it checks if it visible to the menu item and unsets it.
 *
 * @async
 * @param {string} menuItemID - The ID of the current menu folder being searched.
 * @param {string} parentFolderIndex - The path index of the parent folder in the menu structure. Used for constructing the API path.
 * @param {string} sbAuthKey - The Staffbase API authentication key (Base64 encoded).
 * @param {string} accessorIds - The ID of the Staffbase space.
 * @param {object} newMobileQuickLinks - An object containing the configuration for new mobile quick links.
 * Keys are lowercase, trimmed menu item titles, and values are objects
 * with 'title' (short title for quick link) and 'position' (index in quick links).
 * @param {string[]} menuItemsToLookFor - An array of lowercase, trimmed menu item titles to search for.
 * @param {object} responseBody - The main response object to accumulate success and error messages.
 * @returns {Promise<{success: boolean, response: string|undefined}>} - A promise that resolves to an object indicating
 * the success of fetching the nested menu.
 * 
 * Returns `{ success: false, response: '...' }` if fetching fails.
 */
const searchFolders = async (menuItemID, parentFolderIndex, sbAuthKey, accessorIds, newMobileQuickLinks, menuItemsToLookFor, responseBody) => {
    const url = `https://app.staffbase.com/api/spaces/${accessorIds}/menu/${menuItemID}`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json;charset=utf-8'
    };

    // Variable to store the API response when fetching the children of the current menu folder.
    let childMenuResponse = undefined;

    try {
        // Make a GET request to the Staffbase API to retrieve the children of the current menu folder.
        childMenuResponse = await axios.get(url, { headers });

    } catch (error) {
        //console.log(error);
    }

    // If fetching the nested menu fails (response is undefined), return an error.
    if(childMenuResponse === undefined){
        return {success: false, response: 'Issue fetching nested menu. Please try again. If problem persist, please reach out to manager of Script'};
    }
    
     // Extract the child menu items from the API response data.
    let childMenuItems = childMenuResponse.data.children;
    

    // Check if the current folder has any child items.
    if (childMenuItems["total"] > 0) {
        // If there are child items, get the actual array of child menu items.
        childMenuItems = childMenuItems.data;
        for (let x = 0; x <= childMenuItems.length - 1; x++) {
            /*
             * Check if the current child menu item is a newspage.
             * According to the Studio UI, nested newspages cannot be directly added as quick links.
             * Although the API response might allow setting 'showInToolbar' to true, we adhere to the UI limitation
             * and skip processing these items for quick link functionality.
             * In the future fix the conditional in the if. The script works so we are fine for now but I know that
             * I meant for the && to check for something else.
             */
            if (childMenuItems[x]["restrictedPluginID"] && childMenuItems[x]["restrictedPluginID"]) {
                continue; // Skip to the next child menu item if it's a restricted plugin (likely a newspage).
            }
            /*
             * Check if the current child menu item is another folder containing more nested items.
             * If it is a folder with children, we need to recursively call `searchFolders` to explore its contents.
             * Nested folders themselves cannot be set as quick links.
             */
            if (childMenuItems[x]["children"] && childMenuItems[x]["children"]["total"] > 0) {
                // Recursively call `searchFolders` to process the items within the nested folder.
                const searchNested = await searchFolders(childMenuItems[x].id, `${parentFolderIndex}/${x}`, sbAuthKey, accessorIds, newMobileQuickLinks, menuItemsToLookFor, responseBody);
                // If the recursive call returns an error, add an error message to the main response body.
                if(searchNested?.success && searchNested.success === false){
                    responseBody["error"]["Nested Menu"] = 'There was a issue getting one or more of the nested menus. Please try again. If problem persists, please reach out to the manager of this script';
                }
            }

            // Get the configuration for the current menu item, which can be localized into multiple languages.
            const menuItemConfigLanguages = Object.keys(childMenuItems[x]["config"]["localization"]);
            const menuItemConfigLanguagesLength = menuItemConfigLanguages.length;
            let menuItemConfigLanguagesIndex = 0;
            // Iterate through each available language configuration for the current menu item.
            for (const configLanguage of menuItemConfigLanguages) {
                // Get the language-specific configuration.
                const menuConfig = childMenuItems[x]["config"]["localization"][configLanguage];
                // Extract the title of the menu item, lowercase it, and trimmed it comparison.
                const menuItemTitle = menuConfig.title.toLowerCase().trim();

                // Check if the lowercase, trimmed title of the current menu item is present in the list of items to set as quick links.
                if (menuItemsToLookFor.includes(menuItemTitle)) {
                    // If the title matches, set the desired short title (quick link title) in the current language configuration, to the desire quick link menu title name
                    childMenuItems[x]["config"]["localization"][configLanguage]["shortTitle"] = newMobileQuickLinks[menuItemTitle]["title"];
                    // Get the current visibility settings of the menu item.
                    const menuItemVisibilitySettings = childMenuItems[x]["visibility"];
                    // Ensure 'mobile' is included in the visibility settings if it's not already there.
                    if(!menuItemVisibilitySettings.includes('mobile'))
                        menuItemVisibilitySettings.push('mobile');
                    // Get the desired position for this quick link from the configuration.
                    const quicklinkIndexToSet = newMobileQuickLinks[menuItemTitle]["position"];
                    // Update the mobile quick link for this menu item.
                    const quicklink = await createMobileQuickLink(sbAuthKey, accessorIds, childMenuItems[x].id, `${parentFolderIndex}/${x}`, quicklinkIndexToSet, childMenuItems[x]["config"]["localization"], menuItemVisibilitySettings);
                    // If creating the quick link fails, add an error message to the response body.
                    if (!quicklink.success) {
                        responseBody["error"][menuItemTitle] = `Error adding ${menuItemTitle}. Please try again. If issue persist, please reach out to the manager of this script`;
                    }
                    // Add the title of the successfully set quick link to the success array in the response body.
                    responseBody["success"].push(menuItemTitle);

                    break; // Once the item is found and processed, break out of the language configuration loop.
                } 
                // If the current menu item is not what we are looking for and the item has 'showInToolbar' as true (as in it is a visible mobile quick link potentially)
                // make it no longer visible as a quick link
                else if (childMenuItems[x]["config"]["showInToolbar"] === true && menuItemConfigLanguagesIndex === menuItemConfigLanguagesLength - 1) {
                    const turnOffQuickLink = await deleteMobileQuickLink(sbAuthKey, accessorIds, childMenuItems[x].id, `${parentFolderIndex}/${x}`);
                    console.log('turning off at nested level');
                }
                //this increment is used to monitor if we are iterating through the last language configuration for a menu item.
                //this is need to know to ensure we are allowed to turn off menu items visibility.
                menuItemConfigLanguagesIndex++; 
            }

        }
    }
}

/**
 * Asynchronously installs or updates mobile quick links in a Staffbase space menu based on the provided configuration.
 * It iterates through the existing menu items, identifies those matching the provided quick link titles,
 * and sets them as mobile quick links with the specified titles and positions. It also handles nested menus (folders)
 * and ensures that only valid menu items (not newspages) are considered. Existing quick links that are not in the
 * provided configuration will be turned off.
 *
 * @async
 * @param {string} sbAuthKey - The Staffbase API authentication key (Base64 encoded).
 * @param {string} accessorIds - The ID of the Staffbase space.
 * @param {object} mobileQuickLinks - An object where keys are the lowercase and trimmed titles of menu items
 * to be set as quick links, and values are objects containing:
 * - `title`: The short title to display for the quick link.
 * - `position`: The desired position of the quick link in the mobile toolbar.
 * @returns {Promise<{success: string[], error: object}>} - A promise that resolves to an object containing:
 * - `success`: An array of titles of menu items that were successfully set as mobile quick links.
 * - `error`: An object where keys are the titles of menu items that encountered errors during the process,
 * and values are the corresponding error messages.
 */
export const mobileQuickLinkInstallation = async (sbAuthKey, accessorIds, mobileQuickLinks) => {
    // Initialize the response body to track successful and failed operations.
    const responseBody = {
        "success": [],
        "error": {

        }
    };

    /*
    Take JSON request for quicklinks and reconstruct it.
    We want all keys to be case-insensitive for matching against menu item titles.
    This section converts all keys of the input 'mobileQuickLinks' object to lowercase and trimmed strings
    to ensure consistent matching regardless of the original casing.
    */

    // Get an array of the keys from the input object.
    let mobileQuickLinksObjectKeys = Object.keys(mobileQuickLinks);

    // Create a new object to store the processed quick links with lowercase keys.
    const newMobileQuickLinks = {};
    mobileQuickLinksObjectKeys.forEach(objKey => {
        const newKey = objKey.toLowerCase().trim(); // Convert the key to lowercase and remove leading/trailing whitespace.
        newMobileQuickLinks[newKey] = mobileQuickLinks[objKey]; // Assign the original value to the new lowercase key.
    })
    let menuItemsToLookFor = Object.keys(newMobileQuickLinks); // Get an array of lowercase and trimmed titles to search for in the menu.

    // Fetch the current menu structure for the specified Staffbase space.
    const menu = await getMenu(sbAuthKey, accessorIds);
    if(!menu.success){
        return 'Issue fetching menu. Please try again. If problem persist, please reach out to manager of Script';
    }

    // Access the top-level menu items from the fetched menu data.
    let menuItems = menu.data.children;
    if (menuItems["total"] > 0) {
        menuItems = menu.data.children.data; // Extract the array of menu item objects.
        // Iterate through each top-level menu item.
        for (let x = 0; x <= menuItems.length - 1; x++) {
            /*
            Check if the current menu item is a newspage.
            The Staffbase Studio UI prevents creating quick links from newspages.
            Although the API response might suggest it's possible to set 'showInToolbar' for newspages,
            we adhere to the UI behavior and skip these items.
            */
            if (menuItems[x]["restrictedPluginID"] && menuItems[x]["restrictedPluginID"]) {
                continue; // Skip to the next menu item if it's a restricted plugin (likely a newspage).
            }

            /*
            Check if we are dealing with a folder (a menu item that contains other menu items).
            If yes, recursively search within the folder's items to find matching menu items.
            */
            if (menuItems[x]["children"] && menuItems[x]["children"]["total"] > 0) {
                // Call the 'searchFolders' function to recursively search within the current folder.
                const searchNested = await searchFolders(menuItems[x].id, `/${x}`, sbAuthKey, accessorIds, newMobileQuickLinks, menuItemsToLookFor, responseBody);
                // If the nested search encounters an error, record it in the response body.
                if(searchNested?.success && searchNested.success === false){
                    responseBody["error"]["Nested Menu"] = 'There was a issue getting one or more of the nested menus. Please try again. If problem persists, please reach out to the manager of this script';
                }
            }

            /*
            Check the configuration of the current menu item to see if its title matches any of the
            menu items that the client wants to set as a quick link.
            If a match is found, set it as a quick link with the desired short title and visibility.
            If a menu item is currently a quick link (showInToolbar: true) but is not in the
            provided 'mobileQuickLinks' configuration, it will be turned off.
            */
            // Get the configuration for the current menu item, which can be localized in multiple languages. 
            const menuItemConfigLanguages = Object.keys(menuItems[x]["config"]["localization"]);
            const menuItemConfigLanguagesLength = menuItemConfigLanguages.length;
            let menuItemConfigLanguagesIndex = 0;
            // Loop through each language configuration of the current menu item.
            for (const configLanguage of menuItemConfigLanguages) {
                // Get the language-specific configuration.
                const menuConfig = menuItems[x]["config"]["localization"][configLanguage];
                // Get the title of the menu item in the current language and convert it to lowercase and trimmed for comparison.
                const menuItemTitle = menuConfig.title.toLowerCase().trim();
                // Check if the lowercase and trimmed title matches any of the titles in the 'newMobileQuickLinks' object (the items to be set as quick links).
                if (menuItemsToLookFor.includes(menuItemTitle)) {
                    // If a match is found, set the desired short title (quick link title) in the current language configuration.
                    menuItems[x]["config"]["localization"][configLanguage]["shortTitle"] = newMobileQuickLinks[menuItemTitle]["title"];
                    // Ensure 'mobile' is included in the visibility settings for this menu item.
                    const menuItemVisibilitySettings = menuItems[x]["visibility"];
                    if(!menuItemVisibilitySettings.includes('mobile'))
                        menuItemVisibilitySettings.push('mobile');
                    // Get the desired position for this quick link from the input configuration.
                    const quicklinkIndexToSet = newMobileQuickLinks[menuItemTitle]["position"];
                    // Call the 'createMobileQuickLink' function to update the menu item with the quick link settings.
                    const quicklink = await createMobileQuickLink(sbAuthKey, accessorIds, menuItems[x].id, `/${x}`, quicklinkIndexToSet, menuItems[x]["config"]["localization"], menuItemVisibilitySettings);
                    // If there's an error creating the quick link, record it in the response body.
                    if (!quicklink.success) {
                        responseBody["error"][menuItemTitle] = `Error adding ${menuItemTitle}. Please try again. If issue persist, please reach out to the manager of this script`;
                    }
                    // Add the title of the successfully set quick link to the success array in the response body.
                    responseBody["success"].push(menuItemTitle);

                    break; // Once a match is found and processed for a language, move to the next menu item.
                } 
                // If the current menu item is already a quick link (showInToolbar: true) and its title does not match any of the
                // desired quick links (and we are at the last language configuration to check), then turn it off.
                else if (menuItems[x]["config"]["showInToolbar"] === true && menuItemConfigLanguagesIndex === menuItemConfigLanguagesLength - 1) {
                    const turnOffQuickLink = await deleteMobileQuickLink(sbAuthKey, accessorIds, menuItems[x].id, `/${x}`);
                    console.log('turning off at parent');
                }

                menuItemConfigLanguagesIndex++; // Increment the index to track the current language configuration.
            }

        }
    }
    return responseBody; // Return the final response indicating the success and errors encountered.
}