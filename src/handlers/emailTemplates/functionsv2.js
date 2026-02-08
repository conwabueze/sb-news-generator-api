import axios from 'axios';
export const uploadEmailMediaToStaffbase = async (sourceToken, destToken, source_domain, destination_domain, orginalMediumId) => {
    const uploadMediaUrl = `https://${destination_domain}/api/media`;
    const getSingleMediaUrl = `https://${source_domain}/api/media/${orginalMediumId}`;

    try {
        //get image from source enivronment
        const getMediaResponse = await axios.get(getSingleMediaUrl, {
            headers: {
                'Authorization': `Basic ${sourceToken}`,
                'Content-Type': 'application/json'
            },
        });

        const originalImageUrl = getMediaResponse.data.resourceInfo.url;
        const originalFileName = getMediaResponse.data.fileName;

        //upload image to dest env CDN
        const imageFetch = await fetch(originalImageUrl);
        const blob = await imageFetch.blob();
        const file = new File([blob], 'Test File', { type: blob.type });
        const formData = new FormData();
        formData.append('file', file, originalFileName);

        const uploadResponse = await axios.post(uploadMediaUrl, formData, {
            headers: {
                'Authorization': `Basic ${destToken}`,
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
                mediumId: uploadResponse.data.id
            },
        };
    } catch (error) {
        console.log(error);
        return { success: false, data: error };
    }
};

export const createTemplate = async (token, domain, title, galleryId, contentBlocks) => {
    const url = `https://${domain}/api/email-service/templates`;

    const headers = {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        contentData: {
            content: contentBlocks,
            format: "pikasso"
        },
        galleryId,
        "name": `${title}`,
        "renderingMode": "designer",
    };

    try {
        const response = await axios.post(url, payload, { headers });
        console.log(response)
        return { success: true, data: response.data }
    } catch (error) {
        console.log(error);
        return { success: false, data: error }
    }

}

export const retryFunction = async (func, maxRetries = 3, ...args) => {
    let retries = 0;
    let error = ''

    while (retries < maxRetries) {
        const result = await func(...args);

        if (result.success) {
            return result; // Success, return the result
        } else {
            console.warn(`Function call failed. Retrying... (Attempt ${retries + 1} of ${maxRetries})`);
            retries++;
            error = result.data.message;
        }
    }

    console.error(`Function failed after ${maxRetries} attempts.`);
    return { success: false, errorMessage: `Function failed after ${maxRetries} attempts.`, data: error }; // All retries failed
};