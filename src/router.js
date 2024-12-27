import {Router} from 'express';
import { body, validationResult } from 'express-validator';
import { handleInputErrors } from './utils/middleware.js';
import { bulkScrapeLinkedinToStaffbaseArticle } from './handlers/linkedin.js';

const router = Router();

router.post('/bulkscrape/linkedin/article', 
    body('channelID').isString().withMessage("Please make sure you add a 'channelID'. Make sure it is a string"), 
    body('pageURL').isString().withMessage("Please make sure you add a 'pageURL'. Make sure it is a string"),
    body('totalPosts').optional().isNumeric().withMessage("Make sure 'totalPost' is a numeric value"), 
    handleInputErrors, 
    bulkScrapeLinkedinToStaffbaseArticle
);
router.post('/bulkscrape/linkedin/update', () => {});

export default router;