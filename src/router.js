import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { handleInputErrors } from './utils/middleware.js';
import { bulkScrapeLinkedinToStaffbaseArticle, bulkScrapeLinkedinToStaffbaseArticleWithChannels, testRoute} from './handlers/linkedin.js';
import { generateComments } from './handlers/comments.js';
import { installations } from './handlers/installations/installations.js';

const router = Router();

router.post('/bulkscrape/linkedin/article',
    //body('channelID').isString().withMessage("Please make sure you add a 'channelID'. Make sure it is a string"),
    body('pageURL').isString().withMessage("Please make sure you add a 'pageURL'. Make sure it is a string"),
    body('totalPosts').optional().isNumeric().withMessage("Make sure 'totalPost' is a numeric value"),
    handleInputErrors,
    bulkScrapeLinkedinToStaffbaseArticle
);

//router.post('/generate/comments', generateComments);
router.post('/generate/test', testRoute);
router.post('/generate/channels', bulkScrapeLinkedinToStaffbaseArticle);
router.post('/installations', 
    body('chat').optional().isBoolean().withMessage('Please make sure you are using a boolean value for chat'),
    body('launchpad').optional().isArray().withMessage('Please make sure you are using a array value for launchpad'),
    body('journeys').optional().isObject().withMessage('Please make sure you are using a Object for journeys'),
    body('microsoft').optional().isBoolean().withMessage('Please make sure you are using a boolean value for microsoft'),
    body('campaigns').optional().isBoolean().withMessage('Please make sure you are using a boolean value for campaigns'),
    body('mobileQuickLinks').optional().isObject().withMessage('Please make sure you are using a Object for mobileQuickLinks'),
    body('customWidgets').optional().isArray().withMessage('Please make sure you are using a array value for customWidgets'),
    handleInputErrors,
    installations);

export default router;