import merge from "lodash.merge";
import local from "./local.js";
import prod from "./prod.js";

//set default to development if NODE_ENV does not exist
process.env.NODE_ENV = process.env.NODE_ENV || "development";
const stage = process.env.STAGE || 'local';

let envConfig

if (stage === 'production') {
    envConfig = prod
} else if (stage === 'testing') {
    
} else {
    envConfig = local
}

export default merge({
    stage,
    apify: process.env.APIFY_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    port: process.env.PORT
}, envConfig);