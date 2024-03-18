import * as dotenv from 'dotenv';
import { setupApp } from './setup';
import { setupBot } from './setup/bot';

dotenv.config();
const app = setupApp();

const token = process.env.BOT_TOKEN || '';
setupBot(token);

export default app;
