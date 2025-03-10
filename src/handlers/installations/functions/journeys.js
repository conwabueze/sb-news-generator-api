import axios from 'axios';
const journeysDatabase = {
    onboarding: {
        title: 'Onboarding',
        associatedGroup: 'New Employees',
        content: {
            instant: {
                "title": "Welcome to your first day!",
                "content": "<div data-widget-on-card=\"true\" data-widget-conf-background-overlay-color=\"rgba(255, 255, 255, 0.55)\" data-widget-conf-crop-height=\"1152\" data-widget-conf-crop-width=\"3456\" data-widget-conf-crop-origin-y=\"1595.5\" data-widget-conf-crop-origin-x=\"0\" data-widget-conf-background-image-url=\"https://cdn-de1.staffbase.com/eyo-live-de/image/upload/v1590739666/cztmbmKyKu8QwUbR8yMhhoMPLF3WHpptcNvubk9QrNm4DGfkoiKnrKA79OAAJljkfojUrfqviPwV6v0QgOxbJVv7U9NkVth8xQfH7hsKutFtCfbnE5dgzzKPnI6myoXENIbRygBhOlIio7KmwtaAESPSoHHyYlIoOmyeh2vqoK5fM2fT8o0Vg1NiK3UqFQoP/christian-perner-UKLIuV8rAks-unsplash.jpeg\" data-widget-conf-mobile-zone=\"49.888888888888886\" data-widget-type=\"HeroImage\" data-widget-src=\"internal://staffbase.content.widgets.HeroImage\"><div data-heading=\"\"><p><span style=\"color: #d30001;\">Welcome {{user.profile.firstName}},</span></p></div><div data-description=\"\"><p><strong><span style=\"color: #000000;\">It's great to have you with us!</span></strong></p></div></div><p>&nbsp;</p><div data-widget-conf-grid-type=\"66-33\" data-widget-type=\"Section\" data-widget-on-card=\"false\" data-widget-src=\"internal://staffbase.content.widgets.Section\"><div><div data-widget-type=\"StaticContent\" data-widget-on-card=\"false\" data-widget-conf-background-color=\"#ffffff\" data-widget-conf-design=\"2\" data-widget-title=\"Get to know (y)our app\" data-widget-src=\"internal://staffbase.content.widgets.StaticContent\"><p><span style=\"background-color: transparent; font-family: inherit;\">This app will connect you to your colleagues and the company! </span></p><p><span style=\"background-color: transparent; font-family: inherit;\">Here, you will be provided the most recent news, have access to important corporate documents and be able to give your feedback through surveys.&nbsp;</span></p><p><span style=\"background-color: transparent; font-family: inherit;\">Use this time to take a look around and get to know your personalized app! It has been created uniquely for you, and contains a lot of useful information.&nbsp;</span></p><p><span style=\"background-color: transparent; font-family: inherit;\"> </span><strong style=\"background-color: transparent; font-family: inherit;\">Enjoy the app!</strong></p><p>&nbsp;</p><div data-widget-conf-secondary-column-mode=\"true\" data-widget-conf-open-in-mobile-browser=\"false\" data-widget-conf-tile-text-color=\"#000000\" data-widget-conf-tile-bg-color=\"#f3f3f3\" data-widget-type=\"QuickLinks\" data-widget-conf-design=\"2\" data-widget-conf-type=\"tiles\" data-widget-title=\"Quicklinks\" data-widget-src=\"internal://staffbase.content.widgets.QuickLinks\"><ul><li><span class=\"icon we-icon\">A</span><a href=\"https://staffbase.com/en/\" data-title=\"App Settings\" tabindex=\"0\">App Settings</a></li><li><span class=\"icon we-icon\">?</span><a href=\"https://staffbase.com/en/\" data-title=\"Support / FAQ\" tabindex=\"0\">Support / FAQ</a></li><li><span class=\"icon we-icon\">h</span><a href=\"https://staffbase.com/en/\" data-title=\"Netiquette\" tabindex=\"0\">Netiquette</a></li></ul></div><p><strong>&nbsp;</strong></p></div></div><div><div data-widget-type=\"StaticContent\" data-widget-title=\"Your Profile\" data-widget-on-card=\"true\" data-widget-conf-background-color=\"#ffffff\" data-widget-conf-design=\"2\" data-widget-src=\"internal://staffbase.content.widgets.StaticContent\"><div data-widget-type=\"StaticContent\" data-widget-on-card=\"false\" data-widget-conf-background-color=\"#ffffff\" data-widget-conf-design=\"2\" data-widget-src=\"internal://staffbase.content.widgets.StaticContent\"><p style=\"text-align: center;\">{{user.profile.avatar-100}}</p><p style=\"text-align: center;\">Name:&nbsp;<br>{{user.profile.firstName}} {{user.profile.lastName}}<br><br>Location:<br>{{user.profile.location}}<br><br>Department:<br>{{user.profile.department}}</p></div><div data-widget-conf-open-in-mobile-browser=\"false\" data-widget-conf-text-color=\"#ffffff\" data-widget-conf-bg-color=\"#d00303\" data-widget-type=\"Button\" data-widget-conf-href=\"https://app.staffbase.com/profile/\" data-widget-src=\"internal://staffbase.content.widgets.Button\">Update profile</div></div></div></div>",
                "teaser": "",
                "image": null,
                "dayOffset": null,
                "timeOfDay": null,
                "notificationChannels": [
                    "email",
                    "push"
                ]
            },
            day3: {
                "title": "Explore Additional Content",
                "content": "<div data-widget-conf-grid-type=\"66-33\" data-widget-type=\"Section\" data-widget-on-card=\"false\" data-widget-src=\"internal://staffbase.content.widgets.Section\"><div><div data-widget-type=\"StaticContent\" data-widget-on-card=\"false\" data-widget-conf-background-color=\"#ffffff\" data-widget-conf-design=\"2\" data-widget-title=\"Did you know ...\" data-widget-src=\"internal://staffbase.content.widgets.StaticContent\"><p><span style=\"font-weight: 400;\">that there are several <strong>communities</strong> you can join on a voluntary basis?</span></p><p>There are a different groups for different interests, including one for tips on productivity and specifically for IT security.&nbsp;</p><p>To check out more content you can subscribe to:&nbsp;</p><ul><li>open your <em>personal menu</em></li><li>click on <em>my groups</em><br><br><a class=\"internal-link colored clickable\" style=\"background-color: transparent; font-family: inherit;\" href=\"https://app.staffbase.com/settings/groups\" target=\"_blank\" rel=\"nofollow noopener\">Check it out</a></li></ul><p>&nbsp;</p><p><strong>Enjoy!</strong></p></div></div><div><div data-widget-conf-design=\"2\" data-widget-conf-background-color=\"#ffffff\" data-widget-on-card=\"false\" data-widget-title=\"Communities\" data-widget-type=\"StaticContent\" data-widget-src=\"internal://staffbase.content.widgets.StaticContent\"><p><img src=\"https://cdn-de1.staffbase.com/eyo-live-de/image/upload/v1590746074/NxUh4WC4HgtEgJx7Qabkeuq41cytpa6EIxcT3MVXpYgp4l0ezmxFVArl6pTCYMYJgmdKwUgEUR6FqUjxVdGyK2d5K1Q6VSYfMiSm5YGoZNRXjLWTO7GDA3cwHIsuQpJKuKwBFUqPw8IbnUi846tJCZqhd8KjOtPztsLPxnFWz1MPu52I7akmPc83c4Kwpi35/Bildschirmfoto%202020-05-29%20um%2011.54.png\" height=\"688\" width=\"657\" data-original-height=\"688\" data-original-width=\"657\"></p></div><div data-widget-conf-open-in-mobile-browser=\"false\" data-widget-conf-text-color=\"#ffffff\" data-widget-conf-bg-color=\"#d00303\" data-widget-conf-href=\"https://app.staffbase.com/\" data-widget-type=\"Button\" data-widget-src=\"internal://staffbase.content.widgets.Button\">Show all communities</div></div></div>",
                "teaser": "",
                "image": null,
                "dayOffset": 2,
                "timeOfDay": 43500000,
                "notificationChannels": [
                    "email",
                    "push"
                ]
            },
            day5: {
                "title": "Personalize your experience",
                "content": "<div data-widget-type=\"StaticContent\" data-widget-on-card=\"false\" data-widget-conf-background-color=\"#ffffff\" data-widget-conf-design=\"2\" data-widget-title=\"Did you know ...\" data-widget-src=\"internal://staffbase.content.widgets.StaticContent\"><p><span style=\"font-weight: 400;\">1) that you can <strong>mention your colleagues</strong> in comments?</span></p><p>Simply use the <strong>@</strong> followed by the name (e.g. @John) and pick the right person. John will be notified and can easily join the discussion or simply don't miss something he should know about.&nbsp;&nbsp;</p><p>2) that you can<strong> translate posts and comments</strong> if needed?</p><p><span style=\"background-color: transparent; font-family: inherit;\">If you see a post or comment that is not in your language, you can easily translate it using the \"see translation\" button on a post. It will translate the content automatically into your app language!</span></p><p><strong style=\"background-color: transparent; font-family: inherit;\">Enjoy!</strong></p></div><p>&nbsp;</p><div><div data-widget-type=\"StaticContent\" data-widget-title=\"@Fiona look at this!\" data-widget-on-card=\"false\" data-widget-conf-background-color=\"#ffffff\" data-widget-conf-design=\"2\" data-widget-src=\"internal://staffbase.content.widgets.StaticContent\"><p><img src=\"https://cdn-de1.staffbase.com/eyo-live-de/image/upload/c_crop,w_2305,h_2305,x_548/v1591278954/uZADpDtLzFvjTA8mEjlmmc5MkRnNGEgks9cDcBhBzglXybJeLjm24gB7XrfhBt5AV33dcSzRg5GTBxbeDu5H5wBSEG6z3BohBdJxKAkZKzxLwug1AgwTHKul8VyZmdODJbyTj7CqhOzMvEc5A6a6r2hsxI8jLg4Y4l3olvrc3IOZ9MoO3ZSX0VtZc8eN50mQ/meghan-schiereck-_XFObcM_7KU-unsplash.jpeg\"></p></div></div>",
                "teaser": "",
                "image": null,
                "dayOffset": 4,
                "timeOfDay": 43500000,
                "notificationChannels": [
                    "email",
                    "push"
                ]
            },
            day7: {
                "title": "Bookmark important posts",
                "content": "<div data-widget-type=\"Section\" data-widget-conf-grid-type=\"66-33\" data-widget-taype=\"Section\" data-widget-on-card=\"false\" data-widget-src=\"internal://staffbase.content.widgets.Section\"><div><div data-widget-type=\"StaticContent\" data-widget-on-card=\"false\" data-widget-conf-background-color=\"#ffffff\" data-widget-conf-design=\"2\" data-widget-title=\"Did you know ...\" data-widget-src=\"internal://staffbase.content.widgets.StaticContent\"><p><span style=\"font-weight: 400;\">that you can <strong>bookmark</strong>&nbsp;posts?</span></p><p>Simply click the bookmark button below a post. You can a<span style=\"background-color: transparent; font-family: inherit;\">ccess your bookmarks via your personal menu at any time.<br><br></span><strong style=\"background-color: transparent; font-family: inherit;\">Enjoy bookmarking!</strong></p></div></div><div><div data-widget-type=\"StaticContent\" data-widget-on-card=\"false\" data-widget-conf-background-color=\"#ffffff\" data-widget-conf-design=\"2\" data-widget-src=\"internal://staffbase.content.widgets.StaticContent\"><p><img src=\"https://cdn-de1.staffbase.com/eyo-live-de/image/upload/c_crop,w_376,h_598/v1590753520/b8FmCteY0Dk3kAv6qK47Kj1XB1LKJZdLszPRkXuZBSynSXiGZNk5WoI9BRFZAlo33KF8ESSjUoIvsr04admWsiryiMQqEmGA2IdkE9fjBsIEhBpc14oHAi1fy0M8iIbbXB3yDO69zFIDZh821zvFRHZc8ny3gExXSXNhBorNflOFQNTSgycvrohDMhjgNI4f/Bildschirmfoto%202020-05-29%20um%2013.58.png\" data-original-width=\"376\" data-original-height=\"598\"></p></div></div></div>",
                "teaser": "",
                "image": null,
                "dayOffset": 6,
                "timeOfDay": 43500000,
                "notificationChannels": [
                    "email",
                    "push"
                ]
            },
            day30: {
                "title": "Feedback Wanted 🤩🤩🤩🤩🤩🤩🤩🤩🤩🤩",
                "content": "<div data-widget-type=\"Section\" data-widget-conf-grid-type=\"66-33\" data-widget-taype=\"Section\" data-widget-on-card=\"false\" data-widget-src=\"internal://staffbase.content.widgets.Section\"><div><div data-widget-type=\"StaticContent\" data-widget-on-card=\"false\" data-widget-conf-background-color=\"#ffffff\" data-widget-conf-design=\"2\" data-widget-title=\"Did you know ...\" data-widget-src=\"internal://staffbase.content.widgets.StaticContent\"><p><span style=\"font-weight: 400;\">that you can <strong>bookmark</strong>&nbsp;posts?</span></p><p>Simply click the bookmark button below a post. You can a<span style=\"background-color: transparent; font-family: inherit;\">ccess your bookmarks via your personal menu at any time.<br><br></span><strong style=\"background-color: transparent; font-family: inherit;\">Enjoy bookmarking!</strong></p></div></div><div><div data-widget-type=\"StaticContent\" data-widget-on-card=\"false\" data-widget-conf-background-color=\"#ffffff\" data-widget-conf-design=\"2\" data-widget-src=\"internal://staffbase.content.widgets.StaticContent\"><p><img src=\"https://cdn-de1.staffbase.com/eyo-live-de/image/upload/c_crop,w_376,h_598/v1590753520/b8FmCteY0Dk3kAv6qK47Kj1XB1LKJZdLszPRkXuZBSynSXiGZNk5WoI9BRFZAlo33KF8ESSjUoIvsr04admWsiryiMQqEmGA2IdkE9fjBsIEhBpc14oHAi1fy0M8iIbbXB3yDO69zFIDZh821zvFRHZc8ny3gExXSXNhBorNflOFQNTSgycvrohDMhjgNI4f/Bildschirmfoto%202020-05-29%20um%2013.58.png\" data-original-width=\"376\" data-original-height=\"598\"></p></div></div></div>",
                "teaser": "",
                "image": null,
                "dayOffset": 29,
                "timeOfDay": 43500000,
                "notificationChannels": [
                    "email",
                    "push"
                ]
            }
        }
    }
}

const getJourneys = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/installations/administrated?pluginID=journeys';

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

//Install Journeys
const journeyInstallation = async (sbAuthKey, accessorIDs, title) => {
    const installationsURL = `https://app.staffbase.com/api/spaces/${accessorIDs[0]}/installations`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        accessorIDs: accessorIDs,
        config: {
            localization: {
                en_US: {
                    "title": title
                }
            }
        },
        pluginID: "journeys",
        //published: "now"
    }

    try {
        //create journey
        const response = await axios.post(installationsURL, payload, { headers });
        const journeyId = response.data.id;
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }
}

//sets targeted group for Journey, who in groups started it, and if they leave and comeback where do they pick back up
const postJourneySettings = async (sbAuthKey, groupId, journeyId) => {
    const url = `https://app.staffbase.com/api/installations/${journeyId}`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };


    const payload = {
        includeExisting: true,
        journeyType: "joinGroup",
        multipleExecutions: false,
        recipientIds: [groupId]
    }

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }

    } catch (error) {
        return { success: false, data: error }
    }
}

//post journey step
const postJourneyStep = async (sbAuthKey, journeyId, title, content, teaser, image, dayOffset, timeOfDay, notificationChannels) => {
    const url = `https://app.staffbase.com/api/branch/journeys/${journeyId}/posts`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        contents: {
            en_US: {
                title,
                content,
                teaser,
                image
            }
        },
        dayOffset,
        timeOfDay,
        notificationChannels
    }

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

const publishJourney = async (sbAuthKey, groupId, journeyId) => {
    const url = `https://app.staffbase.com/api/installations/${journeyId}`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };


    const payload = {
        published: "now"
    }

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }

    } catch (error) {
        return { success: false, data: error }
    }
}

const getGroups = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/branch/groups';

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


//post a groups seems dependent on the admins default language of the otken we are using.
//the default lanaguage of the user is expected to be wither German or English
const postGroup = async (sbAuthKey, title, accessorIDs) => {
    const url = 'https://app.staffbase.com/api/branch/groups';

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        "type": "enumeration",
        "config": {
            "localization": {
                "de_DE": {
                    "title": title
                },
                "en_US": {
                    "title": title
                }
            }
        },
        "name": title,
        "accessorIDs": []
    }

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

const getUsers = async (sbAuthKey) => {
    const url = `https://app.staffbase.com/api/`;

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

const addUserToGroup = async (sbAuthKey, groupId, userId) => {
    const url = `https://app.staffbase.com/api/groups/${groupId}/users`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    const payload = [userId];

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

const getJourneyNavigator = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/branch/journeys/navigator';

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

const postJourneyNavigator = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/branch/journeys/navigator';

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };


    const payload = {
        localization: {
            en_US: {
                title: 'My Tasks'
            }
        }
    }

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }

    } catch (error) {
        return { success: false, data: error }
    }
}

const getQuickLink = async (sbAuthKey) => {
    const url = 'https://app.staffbase.com/api/branch/quicklinks/?platform=desktop';

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

const postJourneyNavigatorQuickLink = async (sbAuthKey, accessorIDs) => {
    const url = 'https://app.staffbase.com/api/branch/quicklinks/';

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        "platform": "desktop",
        "link": "https://app.staffbase.com/journey-navigator",
        "accessorIds": accessorIDs,
        "localization": {
            "en_US": {
                "name": "My Journey"
            }
        },
        "icon": "\uE85B",
        "priority": 2
    }

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }

    } catch (error) {
        return { success: false, data: error }
    }
}

const getToLinksPlugin = async (sbAuthKey, accessorIDs) => {
    const url = `https://app.staffbase.com/api/installations/administrated?pluginID=link&spaceIDs=${accessorIDs[0]}`;

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

const postToLinksPlugin = async (sbAuthKey, accessorIDs, title, targetURL, icon) => {
    const url = `https://app.staffbase.com/api/spaces/${accessorIDs[0]}/installations`;

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        "pluginID": "link",
        "config": {
            "icon": icon,
            "localization": {
                "en_US": {
                    "title": title
                }
            }
        },
        "accessorIDs": accessorIDs,
        "targetURL": targetURL,
        "published": "now"
    }

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }

    } catch (error) {
        return { success: false, data: error }
    }
}


export const journeysInstallation = async (sbAuthKey, accessorIDs, desiredJourneys, userId) => {
    //Get current list of Journey's and double check if any of the desired Journeys already exist
    //If it does not exist create the neccessary group, if it does not exist, and create the Journey
    let journeysAlreadyExist = false;
    let currentJourneysThatMatchDB = [];
    const currentJourneys = await getJourneys(sbAuthKey);
    if (!currentJourneys.success) {
        return "Error pulling Journeys. Please try again. If issue persist, please reach out to manager of this script";
    }
    else if (currentJourneys.data.total > 0) {
        currentJourneysThatMatchDB = currentJourneys.data.data.map(currJourney => {
            //Assuming that all Journeys have a english title, if the already intalled journey name exist in the DB 
            if (currJourney.config.localization['en_US'] && journeysDatabase[currJourney.config.localization['en_US'].title.toLowerCase().trim()]) {
                return currJourney.config.localization['en_US'].title.toLowerCase().trim();
            }
        });
    }

    const journeysCreated = [];
    const journeysNotAddedAlreadyExists = [];
    const journeysNotAddedNotAOption = [];
    const journeysErrors = {}
    const responseBody = {};
    responseBody['Journeys Created'] = journeysCreated;
    responseBody['Journey Already Exists'] = journeysNotAddedAlreadyExists;
    responseBody['This Journey is not a available option to add'] = journeysNotAddedNotAOption;
    responseBody['Errors'] = journeysErrors;
    const journeysDatabaseKeys = Object.keys(journeysDatabase);
    //Create a final list of what journeys will need to be create

    //if the user wants all journeys will must crosscheck and filter the joureys we offer will those that already exist in the env 
    if (desiredJourneys[0] === 'all') {
        //filter desired Journeys with ones that already exist in the env
        desiredJourneys = journeysDatabaseKeys.filter(item => {
            if (currentJourneysThatMatchDB.includes(item)) {
                journeysNotAddedAlreadyExists.push(item)
            }
            return !currentJourneysThatMatchDB.includes(item)
        });
    }
    //if the user wants a specific set of journeys will must cross check and filter what they desire
    else {
        desiredJourneys = desiredJourneys.filter(item => {
            if (currentJourneysThatMatchDB.includes(item)) {
                journeysNotAddedAlreadyExists.push(item)
            }
            //filter and keep any desire journey that does not already exist in the env
            return !currentJourneysThatMatchDB.includes(item)
        }).filter(item => {
            if (!journeysDatabaseKeys.includes(item))
                journeysNotAddedNotAOption.push(item);
            //filter and keep any desired journey that exist in the journeys database
            return journeysDatabaseKeys.includes(item);
        })
    }

    //Get groups to see if there are aleady expected group names for the Journeys we need to create
    const currentGroups = await getGroups(sbAuthKey);
    if (!currentGroups.success)
        return "Error pulling groups for Journey creation. Please try again. If issue persist, please reach out to manager of this script";
    const groupsTable = {};
    if (currentGroups.data.total > 0) {
        currentGroups.data.data.forEach(group => {
            groupsTable[group.name.toLowerCase()] = group.id;
        });
    }


    for (let journey of desiredJourneys) {
        const journeyName = journey;
        journey = journeysDatabase[journey];
        journeysErrors[journey.title] = [];
        let groupID = undefined;
        if (groupsTable[journey.associatedGroup.toLowerCase()]) {
            groupID = groupsTable[journey.associatedGroup.toLowerCase()];
            journeysErrors[journey.title].push(`Warning: Group, ${journey.associatedGroup}, for the ${journey.title} Journey already exists. I will proceed to attempt the creation of the Journey with this already existing group.`);
        } else {
            const createGroup = await postGroup(sbAuthKey, journey.associatedGroup, accessorIDs);
            if (!createGroup.success) {
                journeysErrors[journey.title].push(`Error creating group for ${journey.title} journey. Please try again. If issue persist, please reach out to manager of this script`);
                continue;
            }
            groupID = createGroup.data.id;

            //add user to group
            const addUserToJourneyGroup = await addUserToGroup(sbAuthKey, groupID, userId);
            if (!addUserToJourneyGroup.success) {
                journeysErrors[journey.title].push(`Error adding user to created journey group for ${journey.title} journey`);
            }
        }

        const journeyInstall = await journeyInstallation(sbAuthKey, accessorIDs, journey.title);
        if (!journeyInstall.success) {
            journeysErrors[journey.title].push(`Error installing ${journey.title} journey. Please try again. If issue persist, please reach out to manager of this script`);
            continue;
        }
        const journeyId = journeyInstall.data.id
        const setJourneyData = await postJourneySettings(sbAuthKey, groupID, journeyId);
        if (!setJourneyData.success) {
            journeysErrors[journey.title].push(`Error setting settings for ${journey.title} journey. Please delete journey and try again. If issue persist, please reach out to manager of this script`);
            continue;
        }
        //loop through journey content items to add journey steps
        const journeySteps = Object.keys(journey.content);
        for (let step of journeySteps) {
            const stepObject = journey.content[step];
            const addJourneyStep = await postJourneyStep(sbAuthKey, journeyId, stepObject.title, stepObject.content, stepObject.teaser, stepObject.image, stepObject.dayOffset, stepObject.timeOfDay, stepObject.notificationChannels);
            if (!addJourneyStep.success) {
                journeysErrors[journey.title].push(`Error adding journey step for ${journey.title} journey. Please delete journey and try again. If issue persist, please reach out to manager of this script`);
                if (step === journeySteps[journeySteps.length - 1] && journeyName === desiredJourneys[desiredJourneys.length - 1]) {
                    return responseBody
                }

            }
        }

        const publish = await publishJourney(sbAuthKey, groupID, journeyId);
        if (!publish.success) {
            journeysErrors[journey.title].push(`Warning: there was a issue publishing/activating the ${journey.title} journey. Please go into the studio and publish the journey.`);
        }

        journeysCreated.push(journey.title);

    }

    //Journey Navigator Add
    let getJourneyNav = await getJourneyNavigator(sbAuthKey);
    let postJourneyNav = undefined;
    if (!getJourneyNav.success && getJourneyNav.data.status === 404) {
        postJourneyNav = await postJourneyNavigator(sbAuthKey);
        if (!postJourneyNav.success)
            journeysErrors['Journey Navigator'] = 'Error adding Journey Navigator. Please try again. If issue persist, please reach out to manager of this script'
        else
            journeysCreated.push('Journey Navigator');
    } else if (!getJourneyNav.success) {
        journeysErrors['Journey Navigator'] = 'Error checking if Journey Navigator. Please try again. If issue persist, please reach out to manager of this script'
    }
    else {
        journeysNotAddedAlreadyExists.push('Journey Navigator');
        postJourneyNav = { success: true };
    }

    //Add Journey Navigator to Home Page Quick Link Menu
    if (postJourneyNav !== undefined && postJourneyNav.success) {
        const quicklinks = await getQuickLink(sbAuthKey);
        if (quicklinks.success) {
            const quicklinkLinks = quicklinks.data.data.map(quicklink => {
                return quicklink.link;
            });

            //if desktop quicklinks do not have a jounrey navigator link. Create the link
            if (!quicklinkLinks.includes('https://app.staffbase.com/journey-navigator')) {
                const journeyNavigator = await postJourneyNavigatorQuickLink(sbAuthKey, accessorIDs);
                if (!journeyNavigator.success)
                    journeysErrors['Journey Navigator Quicklink'] = 'Error adding Journey Navigator Quicklink. Please try again. If issue persist, please reach out to manager of this script'
                else
                    journeysCreated.push('Journey Navigator Quicklink');

            } else {
                journeysNotAddedAlreadyExists.push('Journey Navigator Quicklink');
            }
        } else {
            journeysErrors['Journey Navigator Quick'] = 'Error getting Quicklinks. Please try again. If issue persist, please reach out to manager of this script'
        }
    }

    //Add Journey Navigator in links plugin
    const linksPlugin = await getToLinksPlugin(sbAuthKey, accessorIDs);
    if (linksPlugin.success) {
        let journeyNavExistsInLinksPlugin = false;
        if (linksPlugin.data.total > 0) {
            for (const link of linksPlugin.data.data) {
                if (link.targetURL === 'https://app.staffbase.com/journey-navigator')
                    journeyNavExistsInLinksPlugin = true;
            }
        }

        if (journeyNavExistsInLinksPlugin)
            journeysNotAddedAlreadyExists.push('Journey Navigator Link in Links Plugin');
        else {
            const postJourneyNavToLinksPlugin = await postToLinksPlugin(sbAuthKey, accessorIDs, "Journey Navigator", "https://app.staffbase.com/journey-navigator", "\uE85B");
            if (postJourneyNavToLinksPlugin.success)
                journeysCreated.push('Journey Navigator Link in Links Plugin');
            else
                journeysErrors['Journey Navigator in Links Plugin'] = 'Error adding Journey Navigator to Links Plugin. Please try again. If issue persist, please reach out to manager of this script'
        }
    } else {
        journeysErrors['Journey Navigator in Links Plugin'] = 'Error getting Links Plugin. Please try again. If issue persist, please reach out to manager of this script'
    }



    return responseBody;
}
