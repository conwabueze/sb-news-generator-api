import axios from 'axios';

const applicationDatabase = {
    sharepoint: {
        title: 'Sharepoint',
        url: 'https://www.office.com/',
        description: 'File Repo, M365, Microsoft, Sites',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT22iB5t3WegsRmXagULwbpL_eA1cCD1naqcg&s'
    },
    teams: {
        title: 'Teams',
        url: 'https://www.microsoft.com/en-ca/microsoft-teams/log-in',
        description: 'Collaboratinon, Chat, Video Call, Messaging, Livestreaming, Files, Viva',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/1101px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png'
    },
    outlook: {
        title: 'Outlook',
        url: 'https://outlook.office.com/mail/',
        description: 'Email, Mircosoft, Mail',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg/826px-Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg.png'
    },
    word: {
        title: 'Word',
        url: 'https://www.microsoft.com/en-us/microsoft-365/word',
        description: 'Notes, Document, Document Creation, Files',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg/2203px-Microsoft_Office_Word_%282019%E2%80%93present%29.svg.png'
    },
    powerpoint: {
        title: 'Powerpoint',
        url: 'https://www.microsoft.com/en-us/microsoft-365/powerpoint',
        description: 'Slides, Presentations',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg/2203px-Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg.png'
    },
    excel: {
        title: 'Excel',
        url: 'https://www.microsoft.com/en-us/microsoft-365/excel',
        description: 'Sheets, Database, Data, Data Management',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Microsoft_Excel_2013-2019_logo.svg/1200px-Microsoft_Excel_2013-2019_logo.svg.png'
    },
    workday: {
        title: 'Workday',
        url: 'https://www.workday.com/en-us/signin.html',
        description: 'HRIS, HR, Payroll, Absence, Timeoff',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLFIDB0yG0-HK-KtPAhiDOwrW-bBVmju65ug&s'
    },
    confluence: {
        title: 'Confluence',
        url: 'https://mitarbeiterapp.atlassian.net/wiki/spaces/EC/overview',
        description: 'Documents, How-to, Instructions, Knowlegde Management',
        image: 'https://cdn.worldvectorlogo.com/logos/confluence-1.svg'
    },
    salesforce: {
        title: 'Salesforce',
        url: 'https://mitarbeiterapp.atlassian.net/wiki/spaces/EC/overview',
        description: 'CRM, Sales, Deals, Accounts',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/2560px-Salesforce.com_logo.svg.png',
    },
    slack: {
        title: 'Slack',
        url: 'https://slack.com/ssb/first',
        description: 'Collaboratinon, Chat, Video Call, Messaging',
        image: 'https://cdn.freebiesupply.com/logos/large/2x/slack-logo-icon.png'
    },
    zoom: {
        title: 'Zoom',
        url: 'https://zoom.us/signin',
        description: 'Video meeting, livestream',
        image: 'https://t4.ftcdn.net/jpg/03/75/33/61/360_F_375336103_KQSAG9rQuOgdSx01GNIPK9abZaIeGoGR.jpg'
    },
    ukg: {
        title: 'UKG',
        url: 'https://www.ukg.com/',
        description: 'HRIS, HR, Payroll, Absence, Timeoff',
        image: 'https://assets.wheelhouse.com/media/_solution_logo_07202023_49710648.jpeg'
    },
    servicenow: {
        title: 'ServiceNow',
        url: 'https://www.servicenow.com/',
        description: 'Ticketing, IT, Helpdesk, Service Help',
        image: 'https://play-lh.googleusercontent.com/HdfHZ5jnfMM1Ep7XpPaVdFIVSRx82wKlRC_qmnHx9H1E4aWNp4WKoOcH0x95NAnuYg'
    },
    drive: {
        title: 'Drive',
        url: 'https://workspace.google.com/products/drive/',
        description: 'Files, Storage, Knowledge Repo',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3RaendkWxwbnlsA8UyDPmcDbqIMQETxKYpw&s'
    },
    docs: {
        title: 'Docs',
        url: 'https://docs.google.com/document/u/0/',
        description: 'Notes, Document, Document Creation, Files',
        image: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/Google_Docs.png'
    },
    slides: {
        title: 'Slides',
        url: 'https://workspace.google.com/products/slides/',
        description: 'Presentations, Slides, Presentation',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Google_Slides_logo_%282014-2020%29.svg/1489px-Google_Slides_logo_%282014-2020%29.svg.png'
    },
    sheets: {
        title: 'Sheets',
        url: 'https://workspace.google.com/products/sheets/',
        description: 'Sheets, Database, Data, Data Management',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Google_Sheets_2020_Logo.svg/512px-Google_Sheets_2020_Logo.svg.png'
    },
    travelperk: {
        title: 'Travelperk',
        url: 'https://www.travelperk.com/',
        description: 'Travel, Expenses',
        image: 'https://play-lh.googleusercontent.com/fje71aZ6jMNWsWuIGmkealWptgM90xetbUgAPBNnZ2ighWqCYLpJjNogEZR8ar_2UCse'
    },
    jira: {
        title: 'Jira',
        url: 'https://jira.com',
        description: 'Ticketing',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ3jgHFfaTrS0P36OtkWQwMtRShBYoVXIVug&s'
    }

}

const getLaunchpad = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/branch/launchpad/apps';

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

const postAppToLaunchpad = async (sbAuthKey, accessorIDs, appURL, image, title, description) => {
    const url = 'https://app.staffbase.com/api/branch/launchpad/apps';

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        "url": appURL,
        "image": image,
        "accessorIds": accessorIDs,
        "enforceNewWindow": false,
        "content": {
            "en_US": {
                "title": title,
                "description": description
            }
        },
        "visibility": [
            "desktop",
            "mobile"
        ]
    }

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }
}

export const launchpadInstallation = async (sbAuthKey, accessorIDs, desiredApplications) => {
    const responseBody = {};
    //get current Launchpad items by title
    const applicationDatabaseKeys = Object.keys(applicationDatabase);
    const launchpad = await getLaunchpad(sbAuthKey);
    let currentLaunchpadApps = undefined;
    if (launchpad.data.total > 0) {
        currentLaunchpadApps = launchpad.data.data.map(app => {
            //Grab the key of the first object. In apps content.
            //Example
            // {
            //     de_DE: { title: 'Azure', description: null },
            //     en_US: { title: 'Azure', description: null }
            // }
            //I am asssuming that the title of the app is the same regardless of the language
            //Azure in German, English, and etc is hopefully just Azure and not somthing else.
            const firstContentKey = Object.keys(app.content)[0];
            return app.content[firstContentKey].title.toLowerCase().trim();
        })
    }

    /***  Update/Create Launchpad ****/
    const appsAdded = [];
    const appsNotAdded = [];

    //Situation #1: No apps are currently in the launchpad and they want all the applications offerred 
    if (currentLaunchpadApps === undefined && desiredApplications[0] === 'all') {
        const postPromises = applicationDatabaseKeys.map(async currKey => {
            const currApp = applicationDatabase[currKey];
            const post = await postAppToLaunchpad(sbAuthKey, accessorIDs, currApp.url, currApp.image, currApp.title, currApp.description);
            if (!post.success)
                appsNotAdded.push(currApp.title);
            else
                appsAdded.push(currApp.title);
        });
        await Promise.all(postPromises);
    }
    //Situation #2: Apps are currently in the launchpad but client want all apps available
    else if (currentLaunchpadApps !== undefined && desiredApplications[0] === 'all') {
        //filter list of existing apps in application database with apps already existing in the launchpad
        const filteredArray = applicationDatabaseKeys.filter(item => !currentLaunchpadApps.includes(item));
        desiredApplications = filteredArray;
        const postPromises = desiredApplications.map(async desiredApp => {
            const app = applicationDatabase[desiredApp];

            const post = await postAppToLaunchpad(sbAuthKey, accessorIDs, app.url, app.image, app.title, app.description);
            if (!post.success)
                appsNotAdded.push(app.title);
            else
                appsAdded.push(app.title);

        });
        await Promise.all(postPromises);
    }

    //Situation #3: No apps are currently in the launchpad and the user wants specific apps to addded
    else if (currentLaunchpadApps === undefined && desiredApplications[0] !== 'all') {
        console.log('Hello world')
        const postPromises = desiredApplications.map(async desiredApp => {
            //if app is not a option in application database
            if (!applicationDatabase[desiredApp]) {
                appsNotAdded.push(`${desiredApp} (Not a option at this time)`);
            }
            //if the the desired app is not amongst the current app and is a option, post it
            else {
                const app = applicationDatabase[desiredApp];

                const post = await postAppToLaunchpad(sbAuthKey, accessorIDs, app.url, app.image, app.title, app.description);
                if (!post.success)
                    appsNotAdded.push(app.title);
                else
                    appsAdded.push(app.title);
            }
        });
        await Promise.all(postPromises);
    }
    //Situation #4: Apps are currently in the launchpad and the user wants specific apps to addded
    else if (currentLaunchpadApps !== undefined && desiredApplications[0] !== 'all') {
        //filter the desired applications with what is currently available in the launchpad
        const filteredArray = desiredApplications.filter(item => !currentLaunchpadApps.includes(item));
        desiredApplications = filteredArray;

        const postPromises = desiredApplications.map(async desiredApp => {
            //if app is not a option in application database
            if (!applicationDatabase[desiredApp]) {
                appsNotAdded.push(`${desiredApp} (Not a option at this time)`);
            } else {
                const app = applicationDatabase[desiredApp];
                const post = await postAppToLaunchpad(sbAuthKey, accessorIDs, app.url, app.image, app.title, app.description);
                if (!post.success)
                    appsNotAdded.push(app.title);
                else
                    appsAdded.push(app.title);
            }
        });
        await Promise.all(postPromises);
    }

    responseBody['Apps Added Successfully'] = appsAdded
    responseBody['Apps Added Unsuccessfully'] = appsNotAdded
    return responseBody;
}