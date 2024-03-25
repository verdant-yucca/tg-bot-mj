import { Telegraf, Scenes, session } from 'telegraf';
import sessionLocal from 'telegraf-session-local';
import * as dotenv from 'dotenv';

import { Midjourney } from 'midjourney';
import { commands } from '../../constants/bot';
import { stage } from './scenes';
import { exitOfBot } from '../../utils';
import { logger } from '../../middlewares';
import { greetingsMsg, helpMessage, somethingWentWrong } from '../../constants/messages';
import { getMainMenu } from '../../constants/buttons';
import { ITGData } from '../../types';

dotenv.config();

export var client: Midjourney;
export var bot: Telegraf<Scenes.WizardContext<Scenes.WizardSessionData>>;

export const setupBot = (token: string) => {
    bot = new Telegraf<Scenes.WizardContext>(token);
    client = new Midjourney({
        ServerId: process.env.SERVER_ID,
        ChannelId: process.env.CHANNEL_ID,
        SalaiToken: process.env.SALAI_TOKEN || '',
        // Debug: true,
        Ws: true //enable ws is required for remix mode (and custom zoom)
    });
    client.init();
    stage
        .command(commands.start.command, ctx => ctx.scene.enter('startScene'))
        .hears(commands.createPicture.command, ctx => ctx.scene.enter('generateByTextScene'))
        .hears(commands.stylingAvatar.command, ctx => ctx.scene.enter('stylingAvatarByTextScene'))
        .hears(commands.experiment.command, ctx => ctx.scene.enter('generateByBlandImageScene'))
        .hears(commands.stylingImage.command, ctx => ctx.scene.enter('generateByImageAndTextScene'))
        .hears(commands.help.command, ctx => {
            ctx.replyWithHTML(helpMessage(), { parse_mode: 'Markdown' });
        })
        .on('callback_query', (ctx) => {
            const callback = ctx.update && 'callback_query' in ctx.update ? ctx.update.callback_query : undefined;
            const callbackData = callback && 'data' in callback ? callback.data : '';
            if (callbackData === commands.alreadySubscribes.command) {
                const { first_name } = ctx.from as ITGData;
                ctx.replyWithHTML(greetingsMsg(first_name), { reply_markup: getMainMenu().reply_markup, parse_mode: 'Markdown' });
            } else {
                ctx.scene.enter('generateMoreOrUpscaleScene');
            }
        })
        .command(commands.exit.command, ctx => exitOfBot(ctx));

    bot.use((ctx, next) => logger(ctx, next));
    // bot.use(new sessionLocal({ database: 'data/localSession.json' }).middleware());
    bot.use(session());
    bot.use(stage.middleware());

    bot.launch();

    process.once('SIGINT', () => {
        bot.stop('SIGINT');
        process.exit();
    });
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
