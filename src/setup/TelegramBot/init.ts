import { Scenes, Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';

dotenv.config();
const token = process.env.BOT_TOKEN || '';
let TelegramBot = new Telegraf<Scenes.WizardContext>(token);

export const restartTelegramBot = () => {
    TelegramBot = new Telegraf<Scenes.WizardContext>(token);
};

export default TelegramBot;
