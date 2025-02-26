import axios from 'axios';

export const chatInstallation = async (sbAuthKey, accessorIDs) => {
    const installationsURL = `https://app.staffbase.com/api/spaces/${accessorIDs[0]}/installations`;

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
            }
        },
        pluginID: "chat",
        published: "now"
    }

    try {
        const response = await axios.post(installationsURL, chatPayload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }
}