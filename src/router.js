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
router.post('/generate/channels', bulkScrapeLinkedinToStaffbaseArticleWithChannels);
router.post('/installations', 
    body('chat').optional().isBoolean().withMessage('Please make sure you are using a boolean value'),
    body('launchpad').optional().isArray().withMessage('Please make sure you are using a array value'),
    handleInputErrors,
    installations);

export default router;