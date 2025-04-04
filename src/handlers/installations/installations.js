import { getSBSpaces } from "../../utils/sbChannelCRUD.js"
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { chatInstallation } from "./functions/chat.js";
import { launchpadInstallation } from "./functions/launchpad.js";
import { journeysInstallation } from "./functions/journeys.js";
import { microsoftInstallation } from "./functions/microsoft.js";
import { campaignsInstallation } from "./functions/campaigns.js";
import { customWidgetsInstallation } from "./functions/customWidgets.js";
import { mobileQuickLinkInstallation } from "./functions/mobileQuickLinks.js";
import { hrIntegrationInstallation } from "./functions/hrIntegrations.js";

const getInstallations = async (sbAuthKey, accessorIDs) => {

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    const installationsURL = `https://app.staffbase.com/api/spaces/${accessorIDs[0]}/installations`;

    try {
        const getInstallations = await axios.get(installationsURL, { headers });
        return { success: true, data: getInstallations.data }
    } catch (error) {
        return { success: false, data: error }
    }
}





const getSurveys = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/installations/administrated?pluginID=surveys';

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

const getForms = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/installations/administrated?pluginID=form';

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

const spaceCheck = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/spaces';

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

const getPages = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/pages';

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

export const installations = async (req, res, next) => {
    const scriptResponse = {};

    //request data
    const sbAuthKey = req.headers.authorization.split(' ')[1];
    const chat = req.body.hasOwnProperty("chat") ? req.body.chat : undefined;
    const launchpad = req.body.hasOwnProperty("chat") ? req.body.launchpad : undefined;
    const journeys = req.body.hasOwnProperty("journeys") ? req.body.journeys : undefined;
    const microsoft = req.body.hasOwnProperty("microsoft") ? req.body.microsoft : undefined;
    const campaigns = req.body.hasOwnProperty("campaigns") ? req.body.campaigns : undefined;
    const customWidgets = req.body.hasOwnProperty("customWidgets") ? req.body.customWidgets : undefined;
    const mobileQuickLinks = req.body.hasOwnProperty("mobileQuickLinks") ? req.body.mobileQuickLinks : undefined;
    const hrIntegrations = req.body.hasOwnProperty("hrIntegrations") ? req.body.hrIntegrations : undefined;


    const spaces = await getSBSpaces(sbAuthKey);
    //for some reason pulling spaces with a wrong permission token does not return a auth error, just undefined
    if (spaces.success && spaces.data === undefined) {
        res.status(401).json({ error: 'INCORRECT_SB_AUTH', message: `Please make sure you are using the correct Staffbase API Token. If yes, ensure that it is not disabled. If all fails, reach out to the SE Team.` });
        return;
    }
    const accessorIDs = spaces.data[0].accessorIDs;

    //Check what plugins currently exist in the main space/branchID
    const installations = await getInstallations(sbAuthKey, accessorIDs);
    if (!installations.success) {
        res.status(400).json({ error: 'ISSUE_GETTING_INSTALLATIONS', message: `Issue getting installations. Please try again. If issue persist, please reach out to the SE Team.` });
        return;
    }
    const pluginIDs = installations.data.data.map(plugin => {
        return plugin.pluginID;
    })

    if (chat === true) {
        //if chat is not installed, install it
        if (!pluginIDs.includes('chat')) {
            const installChat = await chatInstallation(sbAuthKey, accessorIDs);
            if (!installChat.success) {
                scriptResponse['chat'] = {
                    success: false,
                    error
                }
                console.log(installChat.error);
            } else {
                scriptResponse['chat'] = {
                    success: true,
                    message: 'Chat has been installed successfully'
                }
            }
        } else {
            scriptResponse['chat'] = {
                success: false,
                message: 'Chat is already installed in this environment'
            }
        }
    }
    if (launchpad !== undefined) {
        const launchpadInstall = await launchpadInstallation(sbAuthKey, accessorIDs, launchpad);
        scriptResponse['launchpad'] = launchpadInstall
    }

    if (journeys !== undefined) {
        if (!journeys["user"])
            scriptResponse['journeys'] = 'Error: Please make sure you provide a "user" key in your Journey JSON';
        else if (!journeys["user"])
            scriptResponse['journeys'] = 'Error: Please make sure you provide a "desired" key in your Journey JSON';
        else if (typeof journeys["user"] !== "string")
            scriptResponse['journeys'] = 'Error: Please make sure you provide a string as the value for "user" in your Journey JSON';
        else if (!Array.isArray(journeys["desired"]))
            scriptResponse['journeys'] = 'Error: Please make sure you provide an Array as the value for "desired" in your Journey JSON';
        else {
            const journeysInstall = await journeysInstallation(sbAuthKey, accessorIDs, journeys["desired"], journeys["user"]);
            scriptResponse['journeys'] = journeysInstall;
        }

    }

    if (microsoft === true) {
        const microsoftInstall = await microsoftInstallation(sbAuthKey);
        scriptResponse['microsoft'] = microsoftInstall;
    }
    if (campaigns === true) {
        const campaignInsalls = await campaignsInstallation(sbAuthKey);
        scriptResponse['campaigns'] = campaignInsalls;
    }
    if (mobileQuickLinks !== undefined) {
        const mobileQuickLinksObjectKeys = Object.keys(mobileQuickLinks);
        console.log(mobileQuickLinksObjectKeys);
        let looksGood = true;
        for (const key of mobileQuickLinksObjectKeys) {
            if (typeof mobileQuickLinks[key] !== 'object') {
                scriptResponse['mobile quicklinks'] = 'Error: Please make sure each mobile link object key is a object';
                console.log('in here');
                looksGood = false;
                break;
            }
            else if (!mobileQuickLinks[key].hasOwnProperty("title")) {
                scriptResponse['mobile quicklinks'] = 'Error: Please make sure each mobile link object has a "title" key';
                looksGood = false;
                break;
            }
            else if (!mobileQuickLinks[key].hasOwnProperty("position")) {
                scriptResponse['mobile quicklinks'] = 'Error: Please make sure each mobile link object has a "position" key';
                looksGood = false;
                break;
            }
            else if (typeof mobileQuickLinks[key]["title"] !== "string") {
                scriptResponse['mobile quicklinks'] = 'Error: Please make sure "title" key is a string';
                looksGood = false;
                break;
            }
            else if (typeof mobileQuickLinks[key]["position"] !== "number") {
                scriptResponse['mobile quicklinks'] = 'Error: Please make sure "position" key is a number';
                looksGood = false;
                break;
            }
        }
        if (looksGood) {
            const menuInstall = await mobileQuickLinkInstallation(sbAuthKey, accessorIDs, mobileQuickLinks);
            scriptResponse['mobile quicklinks'] = menuInstall;
        }
    }
    if(customWidgets !== undefined){
        if(customWidgets.length !== 2){
            scriptResponse['mobile quicklinks'] = 'Error: Please make sure your array has only two values [email, password]';
        }else if(typeof customWidgets[0] !== 'string' || typeof customWidgets[1] !== 'string'){
            scriptResponse['mobile quicklinks'] = 'Error: Please make sure your array is only using string values';
        }else{
            const customWidgetsInstall = await customWidgetsInstallation(customWidgets[0], customWidgets[1]);
            if(customWidgetsInstall === false)
                scriptResponse['mobile quicklinks'] = `Error: some sort of issue is going on here. Make sure you are using the correct creds and try again. If issue persist, please reach out to the manager of this script`;
            else
                scriptResponse['mobile quicklinks'] = 'success';
        }
        
    }
    if(hrIntegrations !== undefined){
       const hrIntegrationsInstall = await hrIntegrationInstallation(hrIntegrations[0],hrIntegrations[1]);
       console.log('hello');
    }

    // if(customWidgets[0]==="all"){
    //     const customWidgetsInstall = customWidgetsInstallation(sbAuthKey);
    // }

    res.status(200).json(scriptResponse);

    //update all pages that have incorrect survey ids

    //first pull all surveys to get current ids
    // const surveys = await getSurveys(sbAuthKey);
    // const surveysData = {};
    // let surveySwapID = "";
    // surveys.data.data.forEach(survey => {
    //     if(survey.hasOwnProperty('published')){
    //         surveysData[survey.id] = {
    //             name: survey.config.localization
    //         }
    //         console.log(surveysData[survey.id]);
    //     }
    // })


    //pull all pages ID
    //loop through each page pull html and any surveys that are not included in current survey id list and replace
    //

    /*
    const forms = await getForms(sbAuthKey);
    const formsLookup = {};
    forms.data.data.forEach(form => {
        if (form.config.localization.en_US.title === 'Feedback Form' || form.config.localization.en_US.title === 'Leave Request') {
            if (!formsLookup[form.config.localization.en_US.title]) {
                formsLookup[form.config.localization.en_US.title] = form.id;
            }
        }
    })
    const pages = await getPages(sbAuthKey);
    pages.data.data.forEach(page => {
        if (page.contents['en_US'] && ['From Our CEO', 'Getting Started', 'My HR'].includes(page.contents['en_US'].title)) {
            console.log(page.contents['en_US']);
            const dom = new JSDOM(page.contents['en_US'].content);
            const document = dom.window.document;
            //console.log(document.documentElement.outerHTML);
            const allDivs = document.querySelectorAll('div[data-widget-title="Ask Me Anything"]');
            allDivs.forEach(div => {
                console.log(div);
                const attributeValue = div.getAttribute('data-widget-conf-installation-id');
                console.log(attributeValue);
            });
        };
    })*/
}