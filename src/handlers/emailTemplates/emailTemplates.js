import { createTemplate, getExistingTemplateNames, getExistingTemplates, putContentToTemplate, replaceSrcUrls, uploadEmailMediaToStaffbase } from "./functions.js"
// Using promises (more modern Node.js)
import { promises as fsPromises } from 'fs';
import path from 'path';

async function readFolderContents(folder) {
    const extractedData = []; // Array to store title and content from all JSON files
    const titlesLists = [];
    try {
        const files = await fsPromises.readdir(folder);
        //console.log(`\nFiles in folder "${folder}":`, files);

        for (const file of files) {
            const filePath = path.join(folder, file);
            const stats = await fsPromises.stat(filePath);

            if (stats.isFile() && file.endsWith('.json')) { // Only process JSON files
                //console.log(`- Reading JSON file: ${file}`);
                try {
                    const fileContent = await fsPromises.readFile(filePath, 'utf8');
                    const jsonData = JSON.parse(fileContent);

                    // Extract title and content
                    const title = jsonData.title;
                    const content = jsonData.content;

                    // Store the extracted data
                    extractedData.push({ fileName: file, title, content });

                } catch (parseError) {
                    console.error(`  Error parsing JSON from ${file}:`, parseError);
                }
            } else if (stats.isDirectory()) {
                console.log(`- Directory (skipping for now): ${file}`);
                // You could recursively call readFolderContents here if you want to
                // process JSON files in subdirectories as well.
                // await readFolderContents(filePath);
            }
        }
        return extractedData; // Return the collected data
    } catch (err) {
        console.error('Error reading directory (promises):', err);
        throw err; // Re-throw the error for the calling function to handle
    }
}


export const templateGeneration = async (req, res, next) => {
    const sbAuthKey = req.headers.authorization.split(' ')[1];
    //#1. Pull list of existing templates and names in env to crosscheck what exactly to add
    const existingTemplatesNames = await getExistingTemplateNames(sbAuthKey, "app.staffbase.com");
    const folderPath = 'src/handlers/emailTemplates/templatePayloads';
    //#2. Loop through each JSON payload file to add template and template content. If template name already exist, skip that file.
    try {
        //get all files from folder templatePayloads
        const files = await fsPromises.readdir(folderPath);

        //go through each file, cross check name, and post template and template content to env if it does not exist.
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = await fsPromises.stat(filePath);
            // Only process JSON files
            if (stats.isFile() && file.endsWith('.json')) {
                try {
                    const fileContent = await fsPromises.readFile(filePath, 'utf8');
                    const jsonData = JSON.parse(fileContent);

                    // Extract title 
                    const title = jsonData.title;

                    //if title exists amongst current templ names skip
                    if (existingTemplatesNames.indexOf(title) !== -1) {
                        console.log("Template already exists");
                        continue;
                    }

                    //Extract imgSrcs
                    const imgSrcs = jsonData.imgSrcs;
                    const sbCDNMediaSrcs = [];
                    //Upload all of the images to the Staffbase CDN and save the CDN URLs in a new array
                    for (const imgSrc of imgSrcs) {
                        //extract filename from GCP URL string
                        const parts = imgSrc.split('/');
                        const fileName = parts.pop();
                        const uploadEmailMedia = await uploadEmailMediaToStaffbase(sbAuthKey, "app.staffbase.com", imgSrc, fileName);
                        sbCDNMediaSrcs.push(uploadEmailMedia.data.url);
                    }

                    console.log(sbCDNMediaSrcs);

                    //Create Template
                    const templateCreation = await createTemplate(sbAuthKey, "app.staffbase.com", title);

                    if (!templateCreation.success) {
                        console.log('issue creating template');
                    }
                    //Get ID of created Template
                    const templateId = templateCreation.data.id;

                    //Extract Content
                    let content = jsonData.content;
                    content = replaceSrcUrls(content, sbCDNMediaSrcs);


                    //PUT(Add) Design Content to template
                    const addDesignToTemplate = await putContentToTemplate(sbAuthKey, "app.staffbase.com", templateId, content);

                    console.log(title);

                } catch (parseError) {
                    console.error(`  Error parsing JSON from ${file}:`, parseError);
                }
            } else {
                console.log(`- Non-JSON File: ${file}`);
            }
        }
    } catch (err) {
        console.error('Error reading directory (promises):', err);
        throw err; // Re-throw the error for the calling function to handle
    }
}


//console.log(templates.data)
// const g = await (readFolderContents('src/handlers/emailTemplates/templatePayloads'));
// console.log(g);
// const sbAuthKey = req.headers.authorization.split(' ')[1];
// const templateCreation = await createTemplate(sbAuthKey, "app.staffbase.com", "Testing a Template");
// if (!templateCreation.success) {
//     res.status(400).json({ error: 'ISSUE_CREATING_TEMPLATE', message: `There was a issue creating the template. Please make sure you using the correct domain and API KEY` });
//     return;
// }
// const templateId = templateCreation.data.id;
// console.log(templateId);
// res.status(200).json({ success: true, message: 'just maybe im done. check me out.' });

