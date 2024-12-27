import express from 'express';
import router from './router.js';
import { protectAuth } from './utils/auth.js';
import cors from 'cors';

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/v1', protectAuth, router);

//start up server
export default app;


