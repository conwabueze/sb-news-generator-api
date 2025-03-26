import axios from 'axios';
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

/*
This function is designed to search through Staffbase menu folder
to look menu items to quicklink set or unset. In a situation there is a nested folder
this function will operate recusively to navigate to until no more nested folders are available
*/
const searchFolders = async (menuItemID, parentFolderIndex, sbAuthKey, accessorIds, newMobileQuickLinks, menuItemsToLookFor, responseBody) => {
    const url = `https://app.staffbase.com/api/spaces/${accessorIds}/menu/${menuItemID}`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json;charset=utf-8'
    };

    let childMenuResponse = undefined;

    try {
        childMenuResponse = await axios.get(url, { headers });

    } catch (error) {
        //console.log(error);
    }

    if(childMenuResponse === undefined){
        return {success: false, response: 'Issue fetching nested menu. Please try again. If problem persist, please reach out to manager of Script'};
    }
    //console.log(childMenuResponse.status);
    //get menu items from folder
    let childMenuItems = childMenuResponse.data.children;
    //console.log(`Child Folder: ${childMenuResponse.data.id}`);

    //look through folder id its has children items
    if (childMenuItems["total"] > 0) {
        childMenuItems = childMenuItems.data;
        for (let x = 0; x <= childMenuItems.length - 1; x++) {
            /*
            Check if child menu item is a newspage.
            The studio UI for menu shows that a nested newspage cannot be made in a quicklink.
            However, from the responsebody when getting the item, its looks like its is possible to set showInToolbar to true.
            We will keep to the UI though and ignore these items since they cannot be set
            */
            if (childMenuItems[x]["restrictedPluginID"] && childMenuItems[x]["restrictedPluginID"]) {
                continue;
            }
            /*
            Now that we are not dealing with a newspage. We must check if we are dealing with a another folder.
            If we are, we must perform recursion to check out those folder items as well.
            Nested folders cannot be set as a quicklink
            */
            if (childMenuItems[x]["children"] && childMenuItems[x]["children"]["total"] > 0) {
                const searchNested = await searchFolders(childMenuItems[x].id, `${parentFolderIndex}/${x}`, sbAuthKey, accessorIds, newMobileQuickLinks, menuItemsToLookFor, responseBody);
                if(searchNested?.success && searchNested.success === false){
                    responseBody["error"]["Nested Menu"] = 'There was a issue getting one or more of the nested menus. Please try again. If problem persists, please reach out to the manager of this script';
                }
            }

            //get menu item configuration by language
            const menuItemConfigLanguages = Object.keys(childMenuItems[x]["config"]["localization"]);
            const menuItemConfigLanguagesLength = menuItemConfigLanguages.length;
            let menuItemConfigLanguagesIndex = 0;
            for (const configLanguage of menuItemConfigLanguages) {
                //get lagnauge config
                const menuConfig = childMenuItems[x]["config"]["localization"][configLanguage];
                //title of the menu config
                const menuItemTitle = menuConfig.title.toLowerCase().trim();

                //check to see if the menu title match any of the menu items the client wants to set as a quick link
                if (menuItemsToLookFor.includes(menuItemTitle)) {
                    //if yes, set the desired short title (quicklink title) to the entire config
                    childMenuItems[x]["config"]["localization"][configLanguage]["shortTitle"] = newMobileQuickLinks[menuItemTitle]["title"];
                    const menuItemVisibilitySettings = childMenuItems[x]["visibility"];
                    if(!menuItemVisibilitySettings.includes('mobile'))
                        menuItemVisibilitySettings.push('mobile');
                    const quicklinkIndexToSet = newMobileQuickLinks[menuItemTitle]["position"];
                    const quicklink = await createMobileQuickLink(sbAuthKey, accessorIds, childMenuItems[x].id, `${parentFolderIndex}/${x}`, quicklinkIndexToSet, childMenuItems[x]["config"]["localization"], menuItemVisibilitySettings);
                    if (!quicklink.success) {
                        responseBody["error"][menuItemTitle] = `Error adding ${menuItemTitle}. Please try again. If issue persist, please reach out to the manager of this script`;
                    }
                    responseBody["success"].push(menuItemTitle);

                    break;
                } else if (childMenuItems[x]["config"]["showInToolbar"] === true && menuItemConfigLanguagesIndex === menuItemConfigLanguagesLength - 1) {
                    const turnOffQuickLink = await deleteMobileQuickLink(sbAuthKey, accessorIds, childMenuItems[x].id, `${parentFolderIndex}/${x}`);
                    console.log('turning off at nested level');
                }
                menuItemConfigLanguagesIndex++;
            }

        }
    } else {
        console.log(`Child Folder ${childMenuResponse.data.id} has no data`);
    }



}

export const mobileQuickLinkInstallation = async (sbAuthKey, accessorIds, mobileQuickLinks) => {
    const responseBody = {
        "success": [],
        "error": {

        }
    };
    /*
    Take JSON request for quicklinks and reconstruct it.
    We want all keys to be case sensitive
    */
    let mobileQuickLinksObjectKeys = Object.keys(mobileQuickLinks);

    const newMobileQuickLinks = {};
    mobileQuickLinksObjectKeys.forEach(objKey => {
        const newKey = objKey.toLowerCase().trim();
        newMobileQuickLinks[newKey] = mobileQuickLinks[objKey];
    })
    let menuItemsToLookFor = Object.keys(newMobileQuickLinks);

    const menu = await getMenu(sbAuthKey, accessorIds);
    if(!menu.success){
        return 'Issue fetching menu. Please try again. If problem persist, please reach out to manager of Script';
    }

    let menuItems = menu.data.children;
    if (menuItems["total"] > 0) {
        menuItems = menu.data.children.data;
        for (let x = 0; x <= menuItems.length - 1; x++) {
            //console.log(` index: ${x} Install ID: ${menuItems[x].installationID}`);
            /*
            Check if menu item is a newspage.
            The studio UI for menu shows that a newspage cannot be made in a quicklink.
            However, from the responsebody when getting the item, its looks like its is possible to set showInToolbar to true.
            We will keep to the UI though and ignore these items since they cannot be set
            */
            if (menuItems[x]["restrictedPluginID"] && menuItems[x]["restrictedPluginID"]) {
                continue;
            }

            /*
            Check if we are dealing with a folder.
            If yes, we look throught the folder items
            */
            if (menuItems[x]["children"] && menuItems[x]["children"]["total"] > 0) {
                const searchNested = await searchFolders(menuItems[x].id, `/${x}`, sbAuthKey, accessorIds, newMobileQuickLinks, menuItemsToLookFor, responseBody);
                if(searchNested?.success && searchNested.success === false){
                    responseBody["error"]["Nested Menu"] = 'There was a issue getting one or more of the nested menus. Please try again. If problem persists, please reach out to the manager of this script';
                }
            }

            /*
            Check each menus configration to see it it had a menu items that we are looking to set
            If it does, set it. If its does, check to see if it is a current menu item that should no be there and unset it.
            Then, keep it pushing
            */
            //Get congifuration by language 
            const menuItemConfigLanguages = Object.keys(menuItems[x]["config"]["localization"]);
            const menuItemConfigLanguagesLength = menuItemConfigLanguages.length;
            let menuItemConfigLanguagesIndex = 0;
            //loop throught the menu items configuration lanugage by language
            for (const configLanguage of menuItemConfigLanguages) {
                //get lagnauge config
                const menuConfig = menuItems[x]["config"]["localization"][configLanguage];
                //title of the menu config
                const menuItemTitle = menuConfig.title.toLowerCase().trim();
                //check to see if the menu title match any of the menu items the client wants to set a squick link
                if (menuItemsToLookFor.includes(menuItemTitle)) {
                    //if yes, set the desired short title (quicklink title) to the entire config
                    menuItems[x]["config"]["localization"][configLanguage]["shortTitle"] = newMobileQuickLinks[menuItemTitle]["title"];
                    const menuItemVisibilitySettings = menuItems[x]["visibility"];
                    if(!menuItemVisibilitySettings.includes('mobile'))
                        menuItemVisibilitySettings.push('mobile');
                    const quicklinkIndexToSet = newMobileQuickLinks[menuItemTitle]["position"];
                    const quicklink = await createMobileQuickLink(sbAuthKey, accessorIds, menuItems[x].id, `/${x}`, quicklinkIndexToSet, menuItems[x]["config"]["localization"], menuItemVisibilitySettings);
                    if (!quicklink.success) {
                        responseBody["error"][menuItemTitle] = `Error adding ${menuItemTitle}. Please try again. If issue persist, please reach out to the manager of this script`;
                    }
                    responseBody["success"].push(menuItemTitle);

                    break;
                } else if (menuItems[x]["config"]["showInToolbar"] === true && menuItemConfigLanguagesIndex === menuItemConfigLanguagesLength - 1) {
                    const turnOffQuickLink = await deleteMobileQuickLink(sbAuthKey, accessorIds, menuItems[x].id, `/${x}`);
                    console.log('turning off at parent');
                }

                menuItemConfigLanguagesIndex++;
            }

        }
    }
    return responseBody;
}