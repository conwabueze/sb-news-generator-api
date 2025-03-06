import axios from 'axios';

const activateMicrosoftConnection = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/branch/integrations/';

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

const addM365Features = async (sbAuthKey, id) => {
    const url = 'https://app.staffbase.com/api/branch/integrations/ms365/features';

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
export const microsoftInstallation = async (sbAuthKey, accessorIDs, desiredJourneys, userId) => {
    let responseBody = {
        "features added": [],
        "features already exist": [],
        "errors": {}
    }

    const activateConnection = await activateMicrosoftConnection(sbAuthKey);
    if(!activateConnection.success && activateConnection.data.status !== 400){
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

    for(const id of ids){
        const m365Features = await addM365Features(sbAuthKey, id);
        if(!m365Features.success && m365Features.data.status === 400){
            responseBody["features already exist"].push(id);
            continue;
        }else if(!m365Features.success){
            responseBody["errors"][id] = `Error adding ${id}. Please try again and reach out to manager of script if issue persist`
        }
        responseBody["features added"].push(id);
    }
    
    return responseBody;
}