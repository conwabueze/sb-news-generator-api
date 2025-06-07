import { createTemplate, getExistingTemplateNames, getExistingTemplates, putContentToTemplate, replaceSrcUrls, retryFunction, uploadEmailMediaToStaffbase } from "./functions.js"
import { promises as fsPromises } from 'fs';
import path from 'path';

export const templateGeneration = async (req, res, next) => {
    const sbAuthKey = req.headers.authorization.split(' ')[1];
    const domain = req.body.domain;
    const returnObject = {
        "Templates Added": [],
        "Templates Already Exist": [],
        "Error Adding Template": []
    }
    //#1. Pull list of existing templates and names in env to crosscheck what exactly to add
    let existingTemplatesNames = await retryFunction(getExistingTemplateNames, 3, sbAuthKey, domain);
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
                    const templateCreation = await retryFunction(createTemplate, 3, sbAuthKey, domain, title);

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

                } catch (parseError) {
                    console.error(`  Error parsing JSON from ${file}:`, parseError);
                }
            }
        }
        res.status(200).json('Templates should be available');
    } catch (err) {
        console.error('Error reading directory (promises):', err);
        throw err; // Re-throw the error for the calling function to handle
    }
}

