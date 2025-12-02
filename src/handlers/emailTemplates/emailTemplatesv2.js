/* Version 2 of email template generator. This version can migrate specific or all emails from one env to the next */
import { addTemplateCoverImage, createTemplate, createTemplateGallery, getExistingTemplateNames, getExistingTemplates, getSBSpaces, getTemplateGallery, putContentToTemplate, replaceSrcUrls, retryFunction, uploadEmailMediaToStaffbase } from "./functions.js"
import { promises as fsPromises } from 'fs';
import path from 'path';

export const templateGeneration = async (req, res, next) => {
    const sbAuthKey = req.headers.authorization.split(' ')[1];
    const domain = req.body.domain;
    /*
    const returnObject = {
        "Templates Added": [],
        "Templates Already Exist": [],
        "Error Adding Template": []
    }
    //#0. Pull accesorId info for various endpoints
    //A accessor ID is needed for almost all the the scripts. Thus we start by getting the accessorID
    const spaces = await getSBSpaces(sbAuthKey, domain);

    //Check if we were able tp successfully pull in the space data
    //For some reason pulling spaces with a wrong permission token does not return a auth error, just undefined. This is why we check for undefined in the data return.
    //If not a success, as in the data return is undefined, return error
    if (spaces.success && spaces.data === undefined) {
        res.status(401).json({ error: 'INCORRECT_SB_AUTH', message: `Please make sure you are using the correct Staffbase API Token. If yes, ensure that it is not disabled. If all fails, reach out to the SE Team.` });
        return;
    }

    //Save accessorID data for the first space.
    //Based on what I have seen the first space always seems to be associated with the root space, "All Employees", regardless if you move the space order around 
    const accessorIDs = spaces.data[0].accessorIDs;

    //#1. Pull List of existing template gallerys
    let currentEnvTemplateGalleries = await getTemplateGallery(sbAuthKey, domain);
    if (!currentEnvTemplateGalleries.success) {
        res.status(400).json({ error: 'ISSUE_GETTING_TEMP GALLERY', message: `There was a issue getting your current envs template gallery. Please try script again. If it keeps failing, please reach out to the SE Team.` });
        return;
    }
    currentEnvTemplateGalleries = currentEnvTemplateGalleries.data.data;

    //#2. Check to see if template library already exist, if not, create one and save ID in both situations.
    let templeGalleryID = undefined;
    for (const gallery of currentEnvTemplateGalleries) {
        if (gallery.name === 'Default Template Gallery') {
            templeGalleryID = gallery.id;
        }
    }

    if (templeGalleryID == undefined) {
        let newGallery = await createTemplateGallery(sbAuthKey, domain, 'Default Template Gallery', 'Pre-defined Templates for your needs', accessorIDs, accessorIDs);
        if (!newGallery.success) {
            res.status(400).json({ error: 'ISSUE_CREATING_TEMP GALLERY', message: `There was a issue creating a template gallery. Please try script again. If it keeps failing, please reach out to the SE Team.` });
            return;
        }
        templeGalleryID = newGallery.data.id;
    }

    //#3 Pull list of existing templates and names in env to crosscheck what exactly to add
    let existingTemplatesNames = await retryFunction(getExistingTemplateNames, 3, sbAuthKey, domain, templeGalleryID);
    if (!existingTemplatesNames.success) {
        res.status(400).json({ error: 'ISSUE_PULLING_TEMPLATES', message: `There was issue with the Staffbase API responsible for pullling templates. Please try script again. If issue persist, please reach out to the SE team.` });
        return;
    }
    existingTemplatesNames = existingTemplatesNames.data;

    //#2. Loop through each JSON payload file to add template and template content. If template name already exist, skip that file.
    const folderPath = 'src/handlers/emailTemplates/templatePayloads'; //path for folder contain all template json files
    try {
        //get all files from folder templatePayloads
        const files = await fsPromises.readdir(folderPath);

        //go through each file, cross check name, and post template and template content to env if it does not exist.
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = await fsPromises.stat(filePath);
            let templateError = false
            // Only process JSON files
            if (stats.isFile() && file.endsWith('.json')) {
                try {
                    const fileContent = await fsPromises.readFile(filePath, 'utf8');
                    const jsonData = JSON.parse(fileContent);

                    // Extract title 
                    const title = jsonData.title;
                    //if title exists amongst current template names skip
                    if (existingTemplatesNames.length > 0 && existingTemplatesNames.indexOf(title) !== -1) {
                        returnObject["Templates Already Exist"].push(title);
                        console.log()
                        continue;
                    }

                    //Extract imgSrcs
                    const imgSrcs = jsonData.imgSrcs;
                    const sbCDNMediaSrcs = []; //array to save all staffbase cdn image links when posted to staffbase
                    //Upload all of the images to the Staffbase CDN and save the CDN URLs in a new array
                    for (const imgSrc of imgSrcs) {
                        //extract filename from GCP URL string
                        const parts = imgSrc.split('/');
                        const fileName = parts.pop();
                        //upload image to Staffbase CDN
                        const uploadEmailMedia = await retryFunction(uploadEmailMediaToStaffbase, 3, sbAuthKey, domain, imgSrc, fileName);
                        if (!uploadEmailMedia.success) {
                            console.log('error');
                            returnObject["Error Adding Template"].push(`${title} (Issue adding media for email template)`);
                            //if there is a issue adding a media item to the staffbase CDN. We will ignore the entire creation of the template.
                            templateError = true;
                            break;
                        }
                        //save cdn link to array
                        sbCDNMediaSrcs.push(uploadEmailMedia.data.url);
                    }

                    //if there was error in the media posting to the staffbase cdn, skip the template creation
                    if (templateError) {
                        continue;
                    }
                    console.log(sbCDNMediaSrcs);
                    //Create Template
                    const templateCreation = await retryFunction(createTemplate, 3, sbAuthKey, domain, title, templeGalleryID);

                    if (!templateCreation.success) {
                        returnObject["Error Adding Template"].push(`${title} (Issue creating template)`);
                        continue;
                    }

                    //Get ID of created Template
                    const templateId = templateCreation.data.id;

                    //Extract Content
                    let content = jsonData.content;

                    //Replace media links of content with new CDN links
                    content = replaceSrcUrls(content, sbCDNMediaSrcs);


                    //PUT(Add) Design Content to template
                    const addDesignToTemplate = await retryFunction(putContentToTemplate, 3, sbAuthKey, domain, templateId, content);

                    if (!addDesignToTemplate.success) {
                        returnObject["Error Adding Template"].push(`${title} (Issue adding content to template)`);
                        continue;
                    }

                    //update cover image of template
                    if (jsonData.hasOwnProperty("thumbnailUrl")) {
                        //extract filename from GCP URL string
                        const imgSrc = jsonData.thumbnailUrl;
                        const parts = imgSrc.split('/');
                        const fileName = parts.pop();
                        //upload image to Staffbase CDN
                        const uploadEmailMedia = await retryFunction(uploadEmailMediaToStaffbase, 3, sbAuthKey, domain, imgSrc, fileName);
                        if (uploadEmailMedia.success) {
                            const addTemplateCoverImg = await retryFunction(addTemplateCoverImage, 3, sbAuthKey, domain, templateId, uploadEmailMedia.data.url);
                        }
                    }
                } catch (parseError) {
                    console.error(`  Error parsing JSON from ${file}:`, parseError);
                }
            }
        }
        res.status(200).json('Templates should be available');
    } catch (err) {
        console.error('Error reading directory (promises):', err);
        throw err; // Re-throw the error for the calling function to handle
    }*/
}

