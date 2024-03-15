import { Telegraf, Scenes } from 'telegraf';
import sessionLocal from 'telegraf-session-local';
import { Midjourney } from 'midjourney';

import { commands } from '../../constants/bot';
import { stage } from './scenes';
import { exitOfBot } from '../../utils';
import { logger } from '../../middlewares';
import * as dotenv from 'dotenv';

dotenv.config();

export var client: any;
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
        .hears('📞 Help', ctx => {
            ctx.replyWithHTML(`В результате ты увидишь изображение с кнопками. 
Кнопки U1, U2, U3, U4 позволяют выбрать результат, после нажатия тебе отправится это изображение. 
Кнопки V1, V2, V3, V4 позволяют сгенерировать ещё 4 картинки по выбранному варианту. 
Кнопка обновления позволяет сгенерировать результат ещё раз исходя из исходного запроса. `);
        })
        .command(commands.exit.command, ctx => exitOfBot(ctx));

    bot.use((ctx, next) => logger(ctx, next));
    bot.use(new sessionLocal({ database: 'data/localSession.json' }).middleware());
    bot.use(stage.middleware());
    bot.use((ctx, next) => {
        if (!ctx.message) {
            ctx.scene.enter('generateMoreOrUpscaleScene');
        } else {
            return next();
        }
    });

    bot.command(commands.start.command, ctx => ctx.scene.enter('startScene'))
        .hears(commands.createPicture.command, ctx => ctx.scene.enter('generateByTextScene'))
        .hears(commands.stylingAvatar.command, ctx => ctx.scene.enter('stylingAvatarByTextScene'))
        .hears(commands.experiment.command, ctx => ctx.scene.enter('generateByBlandImageScene'))
        .hears(commands.stylingImage.command, ctx => ctx.scene.enter('generateByImageAndTextScene'))
        .hears('Help', ctx => {
            ctx.replyWithHTML(`В результате ты увидишь изображение с кнопками. 
Кнопки U1, U2, U3, U4 позволяют выбрать результат, после нажатия тебе отправится это изображение. 
Кнопки V1, V2, V3, V4 позволяют сгенерировать ещё 4 картинки по выбранному варианту. 
Кнопка обновления позволяет сгенерировать результат ещё раз исходя из исходного запроса. `);
        })
        .command(commands.exit.command, ctx => exitOfBot(ctx));

    bot.launch();

    process.once('SIGINT', () => {
        bot.stop('SIGINT');
        process.exit();
    });
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
