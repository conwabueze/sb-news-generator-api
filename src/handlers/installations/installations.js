import { getSBSpaces } from "../../utils/sbChannelCRUD.js"
import { chatInstallation } from "./functions/chat.js";
import { launchpadInstallation } from "./functions/launchpad.js";
import { journeysInstallation } from "./functions/journeys.js";
import { microsoftInstallation } from "./functions/microsoft.js";
import { campaignsInstallation } from "./functions/campaigns.js";
import { customWidgetsInstallation } from "./functions/customWidgets.js";
import { mobileQuickLinkInstallation } from "./functions/mobileQuickLinks.js";
import { workdayMergeInstallation } from "./functions/workdayMergeInstallation.js";


export const installations = async (req, res, next) => {
    //response body once function is executed
    const scriptResponse = {};

    //request data
    const sbAuthKey = req.headers.authorization.split(' ')[1];
    const chat = req.body.hasOwnProperty("chat") ? req.body.chat : undefined;
    const launchpad = req.body.hasOwnProperty("launchpad") ? req.body.launchpad : undefined;
    const journeys = req.body.hasOwnProperty("journeys") ? req.body.journeys : undefined;
    const microsoft = req.body.hasOwnProperty("microsoft") ? req.body.microsoft : undefined;
    const campaigns = req.body.hasOwnProperty("campaigns") ? req.body.campaigns : undefined;
    const customWidgets = req.body.hasOwnProperty("customWidgets") ? req.body.customWidgets : undefined;
    const mobileQuickLinks = req.body.hasOwnProperty("mobileQuickLinks") ? req.body.mobileQuickLinks : undefined;
    const workdayMerge = req.body.hasOwnProperty("workdayMerge") ? req.body.workdayMerge : undefined;
    const domain = req.body.hasOwnProperty("domain") ? req.body.domain : 'app.staffbase.com';

    //A accessor ID is needed for almost all the the scripts. Thus we start by getting the accessorID
    const spaces = await getSBSpaces(domain, sbAuthKey);

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

    //if chat is set to true in request payload, install chat
    if (chat === true) {
        const chatInstall = await chatInstallation(domain, sbAuthKey, accessorIDs);
        console.log(domain);
        scriptResponse['chat'] = chatInstall
    }

    //if launchpad is not set to undefined and assuming the correct data is provide in the payload, install the launchpad applications
    if (launchpad !== undefined) {
        const launchpadInstall = await launchpadInstallation(domain, sbAuthKey, accessorIDs, launchpad);
        scriptResponse['launchpad'] = launchpadInstall
    }

    //if journeys is not set to undefined and assuming the correct data is provide in the payload, install journeys
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
            const journeysInstall = await journeysInstallation(domain, sbAuthKey, accessorIDs, journeys["desired"], journeys["user"]);
            scriptResponse['journeys'] = journeysInstall;
        }

    }

    //if microsoft is set to true, install the microsoft integration
    if (microsoft === true) {
        const microsoftInstall = await microsoftInstallation(domain, sbAuthKey);
        scriptResponse['microsoft'] = microsoftInstall;
    }

    //if campaigns is set to true, add campaigns to the env
    if (campaigns === true) {
        const campaignInsalls = await campaignsInstallation(domain, sbAuthKey);
        scriptResponse['campaigns'] = campaignInsalls;
    }

    //if mobileQuickLinks is set to undefined, add mobile quick links to the env
    if (mobileQuickLinks !== undefined) {
        const mobileQuickLinksObjectKeys = Object.keys(mobileQuickLinks);
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
            const menuInstall = await mobileQuickLinkInstallation(domain, sbAuthKey, accessorIDs, mobileQuickLinks);
            scriptResponse['mobile quicklinks'] = menuInstall;
        }
    }

    //if customWidgets is set to undefined, add custom widgets to the env
    if (customWidgets !== undefined) {
        if (customWidgets.length !== 2) {
            scriptResponse['custom widgets'] = 'Error: Please make sure your array has only two values [email, password]';
        } else if (typeof customWidgets[0] !== 'string' || typeof customWidgets[1] !== 'string') {
            scriptResponse['custom widgets'] = 'Error: Please make sure your array is only using string values';
        } else {
            const customWidgetsInstall = await customWidgetsInstallation(domain, customWidgets[0], customWidgets[1]);
            scriptResponse['custom widgets'] = customWidgetsInstall
        }

    }

    if (workdayMerge !== undefined) {
        if (workdayMerge.length !== 3) {
            scriptResponse['workdayMerge'] = 'Error: Please make sure your array has only three values [email, password, user studio identifier]';
        } else if (typeof workdayMerge[0] !== 'string' || typeof workdayMerge[1] !== 'string' || typeof workdayMerge[2] !== 'string') {
            scriptResponse['workdayMerge'] = 'Error: Please make sure your array is only using string values';
        } else {
            const workdayMergeInstall = await workdayMergeInstallation(domain, workdayMerge[0], workdayMerge[1], workdayMerge[2]);
            scriptResponse['workdayMerge'] = workdayMergeInstall;
        }
    }

    res.status(200).json(scriptResponse);
}