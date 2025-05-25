import axios from 'axios';

export const createTemplate = async (token, domain, title) => {
    const url = `https://${domain}/api/email-service/templates`;

    const headers = {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        "name": `${title}`,
        "renderingMode": "designer",
    };

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

export const getTemplate = async (token, domain, templateId) => {
    const url = `https://${domain}/api/email-service/templates/${templateId}`;

    const headers = {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

export const getExistingTemplates = async (token, domain) => {
    const url = `https://${domain}/api/email-service/templates?limit=100`;

    const headers = {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

export const getExistingTemplateNames = async (token, domain) => {
    const getTemplates = await getExistingTemplates(token, domain);
    if (!getTemplates.success) {
        return { success: false, data: 'error getting existing templates' };
    }
    const templateNames = [];
    for (const template of getTemplates.data.data) {
        templateNames.push(template.name);
    }
    return templateNames;

}

export const putContentToTemplate = async (token, domain, templateId, content) => {
    const url = `https://${domain}/api/email-service/templates/${templateId}/contents/pikasso`;

    const headers = {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        content
    };

    try {
        const response = await axios.put(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }
};

export const replaceSrcUrls = (jsonObject, stringsArr) => {
    const prefix = 'replace me';
    let currIndex = 0;
    function traverseAndReplace(obj) {
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                // Recursively call for nested objects or arrays
                traverseAndReplace(obj[key]);
            } else if (key === 'src' && typeof obj[key] === 'string' && obj[key] === prefix) {
                // Replace the src value if it matches the prefix
                obj[key] = stringsArr[currIndex];
                currIndex++;
            }
        }
    }

    traverseAndReplace(jsonObject);
    return jsonObject;
}

export const uploadEmailMediaToStaffbase = async (apiToken, domain, imageUrl, fileName) => {
    const baseUrl = `https://${domain}/api/media`;

    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageFetch = await fetch(imageUrl);
        const blob = await imageFetch.blob();
        const file = new File([blob], 'Test File', { type: blob.type });
        const formData = new FormData();
        formData.append('file', file, fileName);

        const uploadResponse = await axios.post(baseUrl, formData, {
            headers: {
                'Authorization': `Basic ${apiToken}`,
                'Content-Type': `multipart/form-data;`
            },
        });

        const previewImageData = uploadResponse.data.transformations.t_preview.resourceInfo;
        return {
            success: true,
            data: {
                url: uploadResponse.data.resourceInfo.url,
                previewUrl: previewImageData.url,
                transformations: previewImageData,
            },
        };
    } catch (error) {
        return { success: false, error, errorMessage: `Error uploading image to Staffbase: ${error?.message || error}` };
    }
};