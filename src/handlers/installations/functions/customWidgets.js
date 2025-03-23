import axios from 'axios';
const postCustomWidget = async (sbAuthKey, widgetUrl) => {
    const url = 'https://app.staffbase.com/api/branch/widgets';

    const headers = {
        'Authorization': `Basic ${sbAuthKey}`,
        'Content-Type': 'application/json;charset=utf-8'
    };

    const payload = {
        "url": "https://eirastaffbase.github.io/stock-ticker/dist/staffbase.stock-ticker.js",
        "elements": [
            "stock-ticker"
        ],
        "attributes": [
            "symbol",
            "weeks"
        ]
    }

    try {
        const response = await axios.post(url, payload, { headers });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error }
    }

}

export const customWidgetsInstallation = async (sbAuthKey) => {
    const customWidgetList = {
        "stock-ticker": "https://eirastaffbase.github.io/stock-ticker/dist/staffbase.stock-ticker.js",
        "job-postings": "https://eirastaffbase.github.io/job-postings/dist/staffbase.job-postings.js",
        "weather-time": "https://eirastaffbase.github.io/weather-time/dist/eira.weather-time.js"
    }

    const customWidgetNames = Object.keys(customWidgetList);
        const cwPost = await postCustomWidget(sbAuthKey, "");
        console.log(cwPost.data)
    // for(const name of customWidgetNames){
    //     const cwPost = await postCustomWidget(sbAuthKey, customWidgetList[name]);
    //     console.log(cwPost.data)
    // }
}