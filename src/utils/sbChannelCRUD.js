import puppeteer from 'puppeteer';
import axios from 'axios';

/*
export const createStaffbaseChannel = async (channelNames) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null, // Disable default viewport 
        //args: ['--start-maximized'] // Maximize the browser window  
    }); // Set headless to false to see the browser
    const page = await browser.newPage();

    const createdChannels = {};

    try {
        //go to studio sign in
        await page.goto('https://app.staffbase.com/studio/content/news');
        await page.waitForNavigation();

        //enter in creds and submit
        await page.waitForSelector('[name="identifier"]');
        await page.type('[name="identifier"]', '[redacted]');
        const pass = await page.waitForSelector('#input-password');
        await page.type('#input-password', process.env.STAFFBASE_PW);
        await page.waitForSelector('[type="submit"]');
        await page.click('[type="submit"]');

        //go to news section of studio
        await page.waitForNavigation();

        for (const channelName of channelNames) {
            await page.goto('https://app.staffbase.com/studio/content/news');

            //click create channel
            const createChan = await page.waitForSelector('[data-testid="create-channel-button"]');
            await page.click('[data-testid="create-channel-button"]');

            //enter in channel details and submit
            await page.waitForSelector('[aria-label="Create Channel"] #CreateChannelDialog\\.ChannelName');
            await page.type('[aria-label="Create Channel"] #CreateChannelDialog\\.ChannelName', `${channelName}`);

            const spacesInput = await page.$('[aria-label="Create Channel"] [placeholder="Choose a space..."]');
            if (spacesInput) {
                await spacesInput.click();
                await page.waitForSelector('.ds-single-select__option');
                const spaceOptions = await page.$$('.ds-single-select__option');
                await spaceOptions[0].click()
            }
            await page.waitForSelector('[aria-label="Create Channel"] [value="articles"]');
            await page.click('[aria-label="Create Channel"] [value="articles"]');
            await page.waitForSelector('.ds-modal__button--accept');
            await page.click('.ds-modal__button--accept');

            //publish channel
            await page.waitForNavigation();
            await page.waitForSelector('.actions .activate');
            await page.click('.actions .activate');

            //get channelID from URL
            const channelURL = page.url();
            const idRegex = /\/([a-f0-9]{24})\//; // Regular expression to match the ID
            const match = channelURL.match(idRegex);
            createdChannels[channelName] = match[1].trim();
        }

    } catch (error) {
        console.error('O nooo somethings wrong with puppeteer:', error);
    }


    await browser.close();
    return createdChannels;

}*/

export const createSBNewsChannel = async (authKey, channelName, accessorIDs = []) => {

    const url = 'https://app.staffbase.com/api/installations';

    const data = {
        "pluginID": "news",
        "config": {
            "localization": {
                "en_US": {
                    "title": `${channelName}`, "description": null
                }
            },
            showAdminActions: true,
            showPageBackground: true,
            sidebarVisible: true
        },
        "commentingAllowed": true,
        "commentingEnabledDefault": true,
        "likingAllowed": true,
        "likingEnabledDefault": true,
        "acknowledgingAllowed": true,
        "acknowledgingEnabledDefault": false,
        "highlightingAllowed": true,
        "highlightingEnabledDefault": false,
        "internalSharingAllowed": false,
        "externalSharingAllowed": false,
        "internalSharingEnabledDefault": false,
        "externalSharingEnabledDefault": false,
        "notificationChannelsAllowed": ["email", "push"],
        "notificationChannelsDefault": ["email", "push"],
        "contentType": "articles",
        "visibleInPublicArea": false,
        "accessorIDs": accessorIDs //you need this to have for all users visibility
    };

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(url, data, { headers });
        return response.data.id;
    } catch (error) {
        console.error('Error:', error);
    }


}

export const deleteSBNewsChannel = async (authKey, channelID) => {

    const url = `https://app.staffbase.com/api/installations/${channelID}`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.delete(url, { headers });
        console.log(response);
    } catch (error) {
        console.error('Error:', error);
    }


}

export const publishSBNewsChannel = async (authKey, channelID) => {
    const url = `https://app.staffbase.com/api/installations/${channelID}/publish`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    const data = {};

    try {
        const response = await axios.post(url, {}, { headers });

    } catch (error) {
        console.error('Error:', error);
    }
}

export const unpublishSBNewsChannel = async (authKey, channelID) => {
    const url = `https://app.staffbase.com/api/installations/${channelID}/unpublish`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    const data = {};

    try {
        const response = await axios.post(url, {}, { headers });

    } catch (error) {
        console.error('Error:', error);
    }
}

export const getSBNewsChannels = async (authKey) => {
    const url = `https://app.staffbase.com/api/channels`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    const data = {};

    try {
        const response = await axios.get(url, { headers });
        const channels = response.data.data;
        //console.log(channels);
        const channelIDs = channels.map((channel) => channel.id);
        return channelIDs;
    } catch (error) {
        console.error('Error:', error);
    }
}

export const getSBNewsChannelsBranch = async (authKey) => {
    const url = `https://app.staffbase.com/api/branch/channels`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    const data = {};

    try {
        const response = await axios.get(url, { headers });
        const channels = response.data.data;
        //console.log(channels);
        const channelIDs = channels.map((channel) => channel.id);
        return channelIDs;
    } catch (error) {
        console.error('Error:', error);
    }
}

export const getSBPage = async (authKey, pageID) => {
    const url = `https://app.staffbase.com/api/pages/${pageID}`;
    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    const data = {};

    try {
        const response = await axios.get(url, { headers });
        const page = response.data;
        return page;
    } catch (error) {
        console.error('Error:', error);
    }

}

export const getSBSpaces = async (authKey) => {
    const url = `https://app.staffbase.com/api/spaces`;

    const headers = {
        'Authorization': `Basic ${authKey}`,
        'Content-Type': 'application/json'
    };

    const data = {};

    try {
        const response = await axios.get(url, { headers });
        const data = response.data.data;
        return {success: true, data};
    } catch (error) {
        return {success: false, error};
    }
}
