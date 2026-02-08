/* Version 2 of email template generator. This version can migrate specific or all emails from one env to the next */
import { addTemplateCoverImage, createTemplateGallery, getEmailContents, getEmailMetadata, getExistingTemplateNames, getExistingTemplates, getSBSpaces, getTemplate, getTemplateGallery, putContentToTemplate, replaceSrcUrls } from "./functions.js"
import { uploadEmailMediaToStaffbase, createTemplate, retryFunction } from "./functionsv2.js";
import { promises as fsPromises } from 'fs';
import path from 'path';

export const templateGenerationv2 = async (req, res, next) => {
    const sourceToken = req.headers['x-source-api-key'].split(' ')[1];
    const destToken = req.headers['x-destination-api-key'].split(' ')[1];
    const source_domain = req.body.source_domain;
    const destination_domain = req.body.destination_domain;
    let templeGalleryID = req.body.templateGallery;
    const templates = req.body.templates;
    const drafts = req.body.drafts;

    const returnObject = {
        "Templates Added": [],
        "Templates Already Exist": [],
        "Error Adding Template": []
    }
    /***** 
    *
    *  
    Task #1: Goal here is start by going into the destination domain and point to the correct Template Gallary. We need to know what template
    gallery to push data to.

    The template gallery hear is predetermined. We either look for the id of template gallery 'Default Template Gallery' or create one if one does not exist
    *
    *
    **********/

    /**
     * Step #0. Pull accesorId from desination env - A accessor ID is needed for almost all the the scripts. Thus we start by getting the accessorID
     * **/

    //we need to pull space data to get the accessorid
    const spaces = await getSBSpaces(destToken, destination_domain);

    //Erro check- Check if we were able to successfully pull in the space data
    //For some reason pulling spaces with a wrong permission token does not return a auth error, just undefined. This is why we check for undefined in the data return.
    //If not a success, as in the data return is undefined, return error
    if ((spaces.success && spaces.data === undefined) || spaces.data === undefined) {
        res.status(401).json({ error: 'INCORRECT_SB_AUTH', message: `Please make sure you are using the correct Staffbase API Token. If yes, ensure that it is not disabled. If all fails, reach out to the SE Team.` });
        return;
    }
    //Save accessorID data for the first space.
    //Based on what I have seen the first space always seems to be associated with the root space, "All Employees", regardless if you move the space order around
    //The accessorIDs will be needed to create a new gallery
    const accessorIDs = spaces.data[0].accessorIDs;

    /**
     * Step #1. If there is not a specified gallery use the default on or create one
     * **/
    if (templeGalleryID === undefined) {
        //Pull List of existing template gallerys
        let currentEnvTemplateGalleries = await getTemplateGallery(destToken, destination_domain);
        if (!currentEnvTemplateGalleries.success) {
            res.status(400).json({ error: 'ISSUE_GETTING_TEMP GALLERY', message: `There was a issue getting your current envs template gallery. Please try script again. If it keeps failing, please reach out to the SE Team.` });
            return;
        }
        currentEnvTemplateGalleries = currentEnvTemplateGalleries.data.data;

        //Check to see if default template gallery already exists and save id
        for (const gallery of currentEnvTemplateGalleries) {
            if (gallery.name === 'Default Template Gallery') {
                templeGalleryID = gallery.id;
            }
        }
        //If it doesn't exist, create gallery
        if (templeGalleryID === undefined) {
            //accessorID is the same as adminIds
            let newGallery = await createTemplateGallery(destToken, destination_domain, 'Default Template Gallery', 'Pre-defined Templates for your needs', accessorIDs, accessorIDs);
            if (!newGallery.success) {
                res.status(400).json({ error: 'ISSUE_CREATING_TEMP GALLERY', message: `There was a issue creating a template gallery. Please try script again. If it keeps failing, please reach out to the SE Team.` });
                return;
            }
            templeGalleryID = newGallery.data.id;
        }
    }
    /***** 
    *
    *  
    Task #2: Now that we know what gallery to post the templates to. We need to go into the source environment and pulls all
    emails that we will need to copy.
    *
    *
    **********/

    //Task #2 Pull list of all draft that need to be copied and replace image urls
    //If the user wants all templates, we will need to loop through all galleries and grab emails from each
    //If the user just wants selected emails, we will just target those emails

    /**
     * Step #0. Pull list of data of all templates or drafts that need to copy over
     * **/

    //if user just wants all drafts
    if (drafts.length === 1 && drafts[0] === 'all') {
        return ''
    }
    //if user wants specific drafts
    else {
        //loop through email draft and copy it over to the destination
        for (const draftId of drafts) {
            //get email metadata. need name of email.
            const emailMetadata = await getEmailMetadata(sourceToken, source_domain, draftId);
            if (!emailMetadata.success) {
                res.status(400).json({ error: 'ISSUE_GETTING_SOURCE_EMAIL_METADATA', message: emailMetadata.data.message });
                return;
            };
            const emailName = emailMetadata.data.title;
            //get contents of email draft
            let emailContents = await getEmailContents(sourceToken, source_domain, draftId);
            if (!emailContents.success) {
                res.status(400).json({ error: 'ISSUE_GETTING_SOURCE_EMAIL_CONTENT', message: emailContents.data.message });
                return;
            };
            emailContents = emailContents.data.contents;

            /*
            Once we have the content of the email, we have to loop through the content to identify each image src url,
            and copy the image from the source to deninations. Once the image is transferred we replace it with the new image url
            in the body before posting. 
            */

            //emailContents is a object with nested lanaguage objects that then has another nest object containing the email in that lanaguage
            //though a blocks array. Each block is a object representing each block of the email and its elements.
            //We are only grabbing the first lanaguage.
            emailContents = Object.values(emailContents)[0];

            //loop through each of the content blocks and verifiy which image need to be replaced and do so.
            for (const contentBlock of emailContents.blocks) {
                //each block has columns and each col has items/elements within it
                const contentBlockColumns = contentBlock.content.columns;

                //once you get ahold of the content block cols, we mush go through each column and to access the items of that column
                for (const contentBlockColumn of contentBlockColumns) {
                    const columnItems = contentBlockColumn.columnItems;

                    if (columnItems.length == 0)
                        continue; //if there are no items, just move on

                    //once we got ahold of the columns items, we need to look through each one for images and videos
                    for (const columnItem of columnItems) {
                        if (columnItem.type !== 'IMAGE' && columnItem.type !== 'VIDEO') {
                            continue;
                        }
                        else if (columnItem.type === 'IMAGE') {
                            //get image from email and upload it to new env
                            const uploadedMedia = await retryFunction(uploadEmailMediaToStaffbase, 3, sourceToken, destToken, source_domain, destination_domain, columnItem.content.mediumId)
                            if (!uploadedMedia.success) {
                                res.status(400).json({ error: 'ISSUE_UPLOADING_MEDIA_ERROR', data: uploadedMedia.data });
                                return;
                            }
                            //uploadEmailMediaToStaffbase(sourceToken, destToken, source_domain, destination_domain, columnItem.content.mediumId)

                            //Swap col image(s) with update data
                            columnItem.content.mediumId = uploadedMedia.data.mediumId;
                            columnItem.content.src = uploadedMedia.data.url;
                        }
                        else if (columnItem.type === 'VIDEO') {
                            console.log(columnItem.content.rawSource)
                        }
                    }
                }
            }

            //once the email content is update post that new email in the template library
            const templateCreation = await retryFunction(createTemplate, 3, destToken, destination_domain, emailName, templeGalleryID, emailContents);
            if (!templateCreation.success) {
                res.status(400).json({ error: 'ISSUE_CREATING_TEMPLATE', data: templateCreation.data });
                return;
            }
        };
    }
    res.status(200).json({ message: 'migration complete' });
}

