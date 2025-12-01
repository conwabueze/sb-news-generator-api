import axios from 'axios';

/**
 * @async
 * @function getInstallations
 * @description Retrieves a list of installations for the root space "All Employees" in Staffbase.
 * @param {string} domain - domain of specific Staffbase site
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string[]} accessorIDs - An array of accessor IDs. We leverage the first element of this array to construct the API endpoint to get list of installations
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the installation data returned by the Staffbase API.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.get` call fails (though this is caught and returned within the promise).
 */
const getInstallations = async (domain = 'app.staffbase.com', sbAuthKey, accessorIDs) => {

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    // We assume that the first accessor ID in the array represents the target space, "All Employees".
    const url = `https://${domain}/api/spaces/${accessorIDs[0]}/installations`;

    try {
        const getInstallations = await axios.get(url, { headers });
        return { success: true, data: getInstallations.data }
    } catch (error) {
        return { success: false, data: error }
    }
}

/**
 * @async
 * @function createChat
 * @description Creates a new chat installation within the "All Employees" Staffbase space.
 * 
 * @param {string} domain - domain of specific Staffbase site
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string[]} accessorIDs - An array of accessor IDs from the "All Employees" Staffbase space
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after creating the chat.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught and returned within the promise).
 */
const createChat = async (domain = 'app.staffbase.com', sbAuthKey, accessorIDs) => {
    const url = `https://${domain}/api/spaces/${accessorIDs[0]}/installations`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    const chatPayload = {
        accessorIDs: accessorIDs,
        config: {
            localization: {
                en_US: {
                    title: "Chat"
                }
            },
            icon: "D"
        },
        pluginID: "chat",
        published: "now"
    }

    try {
        const response = await axios.post(url, chatPayload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }
}

/**
 * @async
 * @function chatInstallation
 * @description Checks if the 'chat' plugin is installed in a given Staffbase space and installs it if it's not.
 * 
 * @param {string} domain - domain of specific Staffbase site
 * @param {string} sbAuthKey - The Staffbase API authentication key. 
 * @param {string[]} accessorIDs - An array of accessor IDs from the "All Employees" Staffbase space
 *
 * @returns {Promise<string>} - A promise that resolves to a string indicating the outcome of the operation:
 * - 'Error: Issue getting installations. Please try again. If issue persist, please reach out to the SE Team.': If there's an error fetching existing installations.
 * - 'Error: Issue Installing Chat. Please try again. If issue persist, please reach out to the SE Team.': If there's an error installing the chat plugin.
 * - 'Chat Installed Successfully': If the chat plugin was successfully installed.
 * - 'Chat is already installed': If the chat plugin was already present in the space.
 */
export const chatInstallation = async (domain = 'app.staffbase.com', sbAuthKey, accessorIDs) => {
    //Get all installations from root space
    const currEnvinstallations = await getInstallations(domain, sbAuthKey, accessorIDs);
    if (!currEnvinstallations.success)
        return 'Error: Issue getting installations. Please try again. If issue persist, please reach out to the SE Team.';


    //get every plugin installed in the root space of the env
    const pluginIDs = currEnvinstallations.data.data.map(plugin => {
        return plugin.pluginID;
    })

    //check if 'chat' is not includes in the current plugins installed on the platform
    //if true, install/add chat to that environment 
    if (!pluginIDs.includes('chat')) {
        const installChat = await createChat(domain, sbAuthKey, accessorIDs);
        if (!installChat.success) {
            return 'Error: Issue Installing Chat. Please try again. If issue persist, please reach out to the SE Team.';
        } else {
            return 'Chat Installed Successfully';
        }
    } else {
        return 'Chat is already installed'
    }

}