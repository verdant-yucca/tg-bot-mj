import { Telegraf, Scenes } from 'telegraf';

import { commands } from '../../constants/bot';
import { stage } from './scenes';
import { exitOfBot } from '../../utils/telegramHelpers';
import { logger } from '../../middlewares';
import { Midjourney } from 'midjourney';
import sessionLocal from 'telegraf-session-local';

export var client;
export var bot;

export const setupBot = (token: string) => {
    bot = new Telegraf<Scenes.WizardContext>(token);
    client = new Midjourney({
        ServerId: <string>process.env.SERVER_ID,
        ChannelId: <string>process.env.CHANNEL_ID,
        SalaiToken: <string>process.env.SALAI_TOKEN,
        // Debug: true,
        Ws: true //enable ws is required for remix mode (and custom zoom)
    });
    client.init();
    stage
        .command(commands.start.command, ctx => ctx.scene.enter('startScene'))
        .hears(commands.createPicture.command, ctx => ctx.scene.enter('generateByTextScene'))
        .hears(commands.experiment.command, ctx => ctx.scene.enter('generateByBlandImageScene'))
        .hears(commands.stylingImage.command, ctx => ctx.scene.enter('generateByImageAndTextScene'))
        .command(commands.exit.command, ctx => exitOfBot(ctx));

    bot.use((ctx, next) => logger(ctx, next));
    bot.use(new sessionLocal({ database: 'data/localSession.json' }).middleware());
    bot.use(stage.middleware());

    bot
        .command(commands.start.command, ctx => ctx.scene.enter('startScene'))
        .command('getgroupid', ctx => console.log(ctx))
        .hears(commands.createPicture.command, ctx => ctx.scene.enter('generateByTextScene'))
        .hears(commands.experiment.command, ctx => ctx.scene.enter('generateByBlandImageScene'))
        .hears(commands.stylingImage.command, ctx => ctx.scene.enter('generateByImageAndTextScene'))
        .command(commands.exit.command, ctx => exitOfBot(ctx));

    bot.launch();

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
