import axios from 'axios';

/**
 * @async
 * @function activateMicrosoftConnection
 * @description Activates the default Microsoft 365 integration for the current Staffbase branch.
 *
 * @param {string} [domain='app.staffbase.com'] - The domain of the Staffbase environment.
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after attempting
 * to activate the Microsoft connection.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught
 * and returned within the promise).
 */
const activateMicrosoftConnection = async (domain = 'app.staffbase.com', sbAuthKey) => {
    const url = `https://${domain}/api/branch/integrations/`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };


    const payload = {
        "id": "ms365",
        "config": {
            "isCustom": false,
            "clientId": null,
            "clientSecret": null
        }
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
 * @function addM365Features
 * @description Adds a specific Microsoft 365 feature to the Staffbase integration.
 *
 * @param {string} [domain='app.staffbase.com'] - The domain of the Staffbase environment.
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string} id - The identifier of the Microsoft 365 feature to be added. This ID is specific to the feature within the Staffbase M365 integration.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after attempting to add the M365 feature.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught and returned within the promise).
 */
const addM365Features = async (domain = 'app.staffbase.com', sbAuthKey, id) => {
    const url = `https://${domain}/api/branch/integrations/ms365/features`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };


    const payload = {
        id
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
 * @function microsoftInstallation
 * @description Installs various Microsoft 365 features into a Staffbase environment.
 * It first attempts to activate the Microsoft connection and then iterates through a predefined list of feature IDs to add them.
 *
 * @param {string} [domain='app.staffbase.com'] - The domain of the Staffbase environment.
 * @param {string} sbAuthKey - The Staffbase API authentication key. This should be a base64 encoded string of your API credentials.
 *
 * @returns {Promise<object|string>} - A promise that resolves to either:
 * - An object containing the installation status of each Microsoft 365 feature, with keys:
 * - `"features added"`: An array of feature IDs that were successfully added.
 * - `"features already exist"`: An array of feature IDs that were already present.
 * - `"errors"`: An object where keys are feature IDs that encountered an error during addition, and values are the corresponding error messages.
 * - A string error message if there was an issue activating the Microsoft connection.
 */
export const microsoftInstallation = async (domain = 'app.staffbase.com', sbAuthKey) => {
    let responseBody = {
        "features added": [],
        "features already exist": [],
        "errors": {}
    }

    const activateConnection = await activateMicrosoftConnection(domain, sbAuthKey);
    if (!activateConnection.success && activateConnection.data.status !== 400) {
        responseBody = 'There was a issue adding the Microsoft Connection. Please try again and reach out to manager of script if issue persist';
        return responseBody;
    }

    const ids = [
        "search",
        "documentLibraryWidget",
        "filesWidget",
        "sitesWidget",
        "calendarWidget",
        "tasksWidget",
        "teamsOverviewWidget",
        "teamsFeedWidget",
        "fileViewerWidget",
        "vivaEngageCommunitiesWidget",
        "teamsCollaboration"
    ];

    for (const id of ids) {
        const m365Features = await addM365Features(domain, sbAuthKey, id);
        if (!m365Features.success && m365Features.data.status === 400) {
            responseBody["features already exist"].push(id);
            continue;
        } else if (!m365Features.success) {
            responseBody["errors"][id] = `Error adding ${id}. Please try again and reach out to manager of script if issue persist`
        }
        responseBody["features added"].push(id);
    }

    return responseBody;
}