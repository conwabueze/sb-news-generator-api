import axios from 'axios';

export const getSBSpaces = async (token, domain) => {
    const url = `https://${domain}/api/spaces`;

    const headers = {
        'Authorization': `Basic ${token}`,
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

export const createTemplate = async (token, domain, title, galleryId) => {
    const url = `https://${domain}/api/email-service/templates`;

    const headers = {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        galleryId,
        "name": `${title}`,
        "renderingMode": "designer",
    };

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        console.log(error);
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
        console.log(error);
        return { success: false, data: error }
    }

}

export const getTemplateGallery = async (token, domain) => {
    const url = `https://${domain}/api/email-service/galleries?limit=20`;

    const headers = {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        console.log(error);
        return { success: false, data: error }
    }

}

export const createTemplateGallery = async (token, domain, name, description, accessorIds, adminIds) => {
    const url = `https://${domain}/api/email-service/galleries?limit=20`;

    const headers = {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        name,
        description,
        accessorIds,
        adminIds
    }
    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        console.log(error);
        return { success: false, data: error }
    }

}

export const getExistingTemplates = async (token, domain, galleryId) => {
    const url = `https://${domain}/api/email-service/templates?limit=100&galleryId=${galleryId}`;
    const headers = {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        console.log(error);
        return { success: false, data: error }
    }

}

export const getExistingTemplateNames = async (token, domain, galleryId) => {
    const getTemplates = await getExistingTemplates(token, domain, galleryId);
    console.log(getTemplates.data);
    if (!getTemplates.success) {
        return { success: false, data: 'error getting existing templates' };
    }
    const templateNames = [];
    for (const template of getTemplates.data.data) {
        templateNames.push(template.name);
    }
    return { success: true, data: templateNames };

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
        console.log(error);
        return { success: false, data: error }
    }
};

export const addTemplateCoverImage = async (token, domain, templateId, imageUrl) => {
    const url = `https://${domain}/api/email-service/templates/${templateId}`;

    const headers = {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        "thumbnailUrl": imageUrl
    };

    try {
        const response = await axios.patch(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        console.log(error);
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
        console.log(error);
        return { success: false, error, errorMessage: `Error uploading image to Staffbase: ${error?.message || error}` };
    }
};

export const retryFunction = async (func, maxRetries = 3, ...args) => {
    let retries = 0;

    while (retries < maxRetries) {
        const result = await func(...args);

        if (result.success) {
            return result; // Success, return the result
        } else {
            console.warn(`Function call failed. Retrying... (Attempt ${retries + 1} of ${maxRetries})`);
            retries++;
        }
    }

    console.error(`Function failed after ${maxRetries} attempts.`);
    return { success: false, errorMessage: `Function failed after ${maxRetries} attempts.`, originalError: null }; // All retries failed
};