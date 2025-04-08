import axios from 'axios';

//Object storing all possible journey options to add to an environment
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

/**
 * @async
 * @function getJourneys
 * @description Retrieves a list of installations of the 'journeys' plugin across all spaces that are administered by the authenticated user in Staffbase.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key. 
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the data returned by the Staffbase API, which is expected to be a list of 'journeys' plugin installations.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.get` call fails (though this is caught and returned within the promise).
 */
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

/**
 * @async
 * @function createJourney
 * @description Creates a new journey installation within a specific Staffbase space.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key. This should be a base64 encoded string of your API credentials.
 * @param {string[]} accessorIDs - An array of accessor IDs that will have access to this journey installation. The function uses the first element of this array to construct the API endpoint for the space.
 * @param {string} title - The desired title for the new journey. This title will be used in the English (US) localization.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after creating the journey, including the journey's ID.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught and returned within the promise).
 */
const createJourney = async (sbAuthKey, accessorIDs, title) => {
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
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }
}

/**
 * @async
 * @function createJourneySettings
 * @description sets settings for a sepcified journey. This includes
 * 1. What group this jounrey is targeted to (recipientIds: [groupId])
 * 2. When a person leaves the journey, where do they start.
 * 3. Who is in the groups starts. New members only or everyone inlcuding already exiting members of the group.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key. This should be a base64 encoded string of your API credentials.
 * @param {string} groupId - The ID of the Staffbase user group that this journey will be associated with.
 * @param {string} journeyId - The ID of the Staffbase journey installation to configure.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after creating the journey settings.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught and returned within the promise).
 */

//sets targeted group for Journey, who in groups started it, and if they leave and comeback where do they pick back up
const createJourneySettings = async (sbAuthKey, groupId, journeyId) => {
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

/**
 * @async
 * @function postJourneyStep
 * @description Creates a new Journey step within a specific Staffbase journey.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string} journeyId - The unique identifier of the journey to which this step will be added.
 * @param {string} title - The title of the journey step.
 * @param {string} content - The main content of the journey step. 
 * @param {string} teaser - A short teaser or summary of the journey step.
 * @param {string} image - The URL or identifier of an image to be associated with the journey step.
 * @param {number} dayOffset - The number of days after the journey start date when this step should be triggered (e.g., 0 for the start day, 1 for the next day).
 * @param {string} timeOfDay - The time of day when this step should be triggered.
 * @param {string[]} notificationChannels - An array of notification channels through which users should be notified about this step (e.g., ["push"], ["email"]).
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after creating the journey step.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught and returned within the promise).
 */
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

/**
 * @async
 * @function publishJourney
 * @description Publishes a specific journey within Staffbase, making it visible to users.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string} journeyId - The unique ID of the journey to be published. This ID is used to construct the API endpoint.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after attempting to publish the journey.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught and returned within the promise).
 */
const publishJourney = async (sbAuthKey, journeyId) => {
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

/**
 * @async
 * @function getGroups
 * @description Retrieves a list of all groups from the Staffbase platform.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the group data returned by the Staffbase API. This likely includes an array of group objects.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.get` call fails (though this is caught and returned within the promise).
 */
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

/**
 * @async
 * @function postGroup
 * @description Creates a new group in Staffbase. It sets the group title for both German (de_DE) and English (en_US) localizations.
 * @remarks This function's behavior for setting the group title is influenced by the default language of the Staffbase user in the Content Languages. 
 * It assumes the default language is either German or English to ensure the title is correctly applied. If it is not, a error will be produced
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string} title - The desired title for the new group. This title will be used for both German and English localizations.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after creating the group.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught and returned within the promise).
 */
const postGroup = async (sbAuthKey, title) => {
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

/**
 * @async
 * @function addUserToGroup
 * @description Adds a specific user to a Staffbase group.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string} groupId - The unique identifier of the Staffbase group to which the user will be added.
 * @param {string} userId - The unique identifier of the Staffbase user to be added to the group.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after adding the user to the group.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught and returned within the promise).
 */
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

/**
 * @async
 * @function getJourneyNavigator
 * @description Retrieves the Journey Navigator configuration from the Staffbase API.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the Journey Navigator configuration data returned by the Staffbase API.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.get` call fails (though this is caught and returned within the promise).
 */
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

/**
 * @async
 * @function postJourneyNavigator
 * @description Creates a new Journey Navigator entry within Staffbase.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after creating the Journey Navigator entry.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught and returned within the promise).
 */
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

/**
 * @async
 * @function getQuickLink
 * @description Retrieves the quick links configuration for the desktop platform from the Staffbase API.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the quick links data returned by the Staffbase API.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.get` call fails (though this is caught and returned within the promise).
 */
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

/**
 * @async
 * @function postJourneyNavigatorQuickLink
 * @description Creates a new quick link in the Staffbase branch menu that directs users to the Journey Navigator.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string[]} accessorIDs - An array of accessor IDs that will have this quick link available to them in their branch menu.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after creating the quick link.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught and returned within the promise).
 */
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

/**
 * @async
 * @function getToLinksPlugin
 * @description Retrieves information about the 'link' plugin installation within a specific Staffbase space.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string[]} accessorIDs - An array of accessor IDs. The function uses the first element of this array to specify the target space ID in the API request.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API, which should include information about the 'link' plugin installation.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.get` call fails (though this is caught and returned within the promise).
 */
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

/**
 * @async
 * @function postToLinksPlugin
 * @description Creates a new link installation within a specific Staffbase space using the 'link' plugin.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string[]} accessorIDs - An array of accessor IDs that will have access to this link. The function uses the first element of this array to construct the API endpoint for the space.
 * @param {string} title - The title that will be displayed for this link in the Staffbase app (in English - US).
 * @param {string} targetURL - The URL that this link will redirect to when clicked.
 * @param {string} icon - The icon identifier to be used for this link in the Staffbase app.
 *
 * @returns {Promise<{ success: boolean, data: object|Error }>} - A promise that resolves to an object.
 * - If the API call is successful, the object will have:
 * - `success`: true
 * - `data`: An object containing the response data from the Staffbase API after creating the link.
 * - If the API call fails, the object will have:
 * - `success`: false
 * - `data`: The error object caught during the API call.
 *
 * @throws {Error} Will throw an error if the `axios.post` call fails (though this is caught and returned within the promise).
 */
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

/**
 * @async
 * @function journeysInstallation
 * @description Installs and configures specified journeys for a Staffbase space. It handles checking for existing journeys, creating necessary groups, adding users to groups, creating journey steps, publishing journeys, and adding the Journey Navigator to the home screen and links plugin.
 *
 * @param {string} sbAuthKey - The Staffbase API authentication key.
 * @param {string[]} accessorIDs - An array of accessor IDs. The function likely uses the first element to identify the target space for the journeys.
 * @param {string[]} desiredJourneys - An array of journey names to be installed. You can also pass `['all']` to install all journeys available in the `journeysDatabase`.
 * @param {string} userId - The ID of the user who should be added to the associated groups for the created journeys.
 *
 * @returns {Promise<object>} - A promise that resolves to an object containing the results of the journey installation process:
 * - `'Journeys Created'`: An array of journey titles that were successfully created and configured.
 * - `'Journey Already Exists'`: An array of journey titles that were not created because they already exist in the environment.
 * - `'This Journey is not a available option to add'`: An array of journey names that were requested but are not found in the `journeysDatabase`.
 * - `'Errors'`: An object where keys are journey titles or "Journey Navigator" related items, and values are arrays of error messages encountered during the process for that specific item.
 */
export const journeysInstallation = async (sbAuthKey, accessorIDs, desiredJourneys, userId) => {
    //response body variables
    const journeysCreated = [];
    const journeysNotAddedAlreadyExists = [];
    const journeysNotAddedNotAOption = [];
    const journeysErrors = {}
    const responseBody = {};
    responseBody['Journeys Created'] = journeysCreated;
    responseBody['Journey Already Exists'] = journeysNotAddedAlreadyExists;
    responseBody['This Journey is not a available option to add'] = journeysNotAddedNotAOption;
    responseBody['Errors'] = journeysErrors;

    //Get current list of Journey's and double check if any of the current journeys in the env is also availble in the journeys database.
    let currentJourneysThatMatchDB = [];
    const currentJourneys = await getJourneys(sbAuthKey);
    if (!currentJourneys.success) {
        return "Error pulling Journeys. Please try again. If issue persist, please reach out to manager of this script";
    }
    else if (currentJourneys.data.total > 0) {
        currentJourneysThatMatchDB = currentJourneys.data.data.map(currJourney => {
            //Assuming that all Journeys have a english title, check if the already installed journey name exist in the DB 
            if (currJourney.config.localization['en_US'] && journeysDatabase[currJourney.config.localization['en_US'].title.toLowerCase().trim()]) {
                return currJourney.config.localization['en_US'].title.toLowerCase().trim();
            }
        });
    }

    //Create a final list of what journeys will need to be create
    //start by pulling list of journey names from journeysDatabase
    const journeyNamesInJourneysDatabaseKeys = Object.keys(journeysDatabase);
    

    //if the user wants all journeys we must crosscheck and filter the joureys we offer with those that already exist in the env 
    if (desiredJourneys[0] === 'all') {
        //filter desired Journeys with ones that already exist in the env
        //the new filtered array is reassigned to desiredJourneys from client request
        desiredJourneys = journeyNamesInJourneysDatabaseKeys.filter(item => {
            if (currentJourneysThatMatchDB.includes(item)) {
                journeysNotAddedAlreadyExists.push(item)
            }
            return !currentJourneysThatMatchDB.includes(item)
        });
    }
    //if the user wants a specific set of journeys we must cross check and filter what they desire
    else {
        //first filter desiredJourneys from client request with journeys in that may already exist in the environment
        //second filter desireJourneys that dont already exist with journeys the database actually offers.
        desiredJourneys = desiredJourneys.filter(item => {
            if (currentJourneysThatMatchDB.includes(item)) {
                journeysNotAddedAlreadyExists.push(item)
            }
            //filter and keep any desire journey that does not already exist in the env
            return !currentJourneysThatMatchDB.includes(item)
        }).filter(item => {
            if (!journeyNamesInJourneysDatabaseKeys.includes(item))
                journeysNotAddedNotAOption.push(item);
            //filter and keep any desired journey that exist in the journeys database
            return journeyNamesInJourneysDatabaseKeys.includes(item);
        })
    }

    //Now that we have a list of items that we are going to add, we can start the process of creating the journey

    //First, we get all groups in the env and there group names to later see if there is already the expected group names to attach to the journey.
    //if not, we them and atach them to the journey
    const existingGroups = await getGroups(sbAuthKey);
    if (!existingGroups.success)
        return "Error pulling groups for Journey creation. Please try again. If issue persist, please reach out to manager of this script";
    const existingGroupsDictionary = {}; //saves (group name : group id) in current env
    if (existingGroups.data.total > 0) {
        existingGroups.data.data.forEach(group => {
            existingGroupsDictionary[group.name.toLowerCase()] = group.id;
        });
    }

    //loop through all the journeys the client desires and create them
    for (let journey of desiredJourneys) {
        const journeyName = journey; //save journey name
        journey = journeysDatabase[journey]; //pull journey data from database
        journeysErrors[journey.title] = []; //create response array to track errors to later return to client

        //group creation or modifications
        let groupID = undefined;
        //if group needed for journey already exist in the env, add user to group
        if (existingGroupsDictionary[journey.associatedGroup.toLowerCase()]) {
            groupID = existingGroupsDictionary[journey.associatedGroup.toLowerCase()];
            const addUserToJourneyGroup = await addUserToGroup(sbAuthKey, groupID, userId);
            if (!addUserToJourneyGroup.success) {
                journeysErrors[journey.title].push(`Error adding user to existing journey group for ${journey.title} journey`);
            }
            journeysErrors[journey.title].push(`Warning: Group, ${journey.associatedGroup}, for the ${journey.title} Journey already exists. I will proceed to attempt the creation of the Journey with this already existing group.`);
        } 
        //if group does not exist, create group and add user
        else {
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

        //create journey
        const journeyInstall = await createJourney(sbAuthKey, accessorIDs, journey.title);
        if (!journeyInstall.success) {
            journeysErrors[journey.title].push(`Error installing ${journey.title} journey. Please try again. If issue persist, please reach out to manager of this script`);
            continue;
        }

        //set journey data
        const journeyId = journeyInstall.data.id
        const setJourneyData = await createJourneySettings(sbAuthKey, groupID, journeyId);
        if (!setJourneyData.success) {
            journeysErrors[journey.title].push(`Error setting settings for ${journey.title} journey. Please delete journey and try again. If issue persist, please reach out to manager of this script`);
            continue;
        }

        //loop through journey content items and add journey steps
        const journeySteps = Object.keys(journey.content);
        for (let step of journeySteps) {
            const stepObject = journey.content[step];
            const addJourneyStep = await postJourneyStep(sbAuthKey, journeyId, stepObject.title, stepObject.content, stepObject.teaser, stepObject.image, stepObject.dayOffset, stepObject.timeOfDay, stepObject.notificationChannels);
            if (!addJourneyStep.success) {
                journeysErrors[journey.title].push(`Error adding journey step for ${journey.title} journey. Please delete journey and try again. If issue persist, please reach out to manager of this script`);
                //this is here to monitor if we are at the end of looping through the desired journey and their steps. We return the response body early since there is nothing more we can do here since we are encountering errors.
                if (step === journeySteps[journeySteps.length - 1] && journeyName === desiredJourneys[desiredJourneys.length - 1]) {
                    return responseBody
                }

            }
        }

        //publish journey
        const publish = await publishJourney(sbAuthKey, journeyId);
        if (!publish.success) {
            journeysErrors[journey.title].push(`Warning: there was a issue publishing/activating the ${journey.title} journey. Please go into the studio and publish the journey.`);
        }

        //pushed created journey to response body
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
