import { session } from 'telegraf';
import * as dotenv from 'dotenv';
import { commands } from '../../constants/bot';
import { stage } from './scenes';
import { exitOfBot } from '../../utils/telegramHelpers';
import { logger } from '../../middlewares';
import { greetingsMsg, helpMessage } from '../../constants/messages';
import { getMainMenu } from '../../constants/buttons';
import { ITGData } from '../../types';
import { checkIsGroupMember } from '../../utils/checks/checkIsGroupMember';
import TelegramBot from './init';
import { escapeTelegrafMarkdown } from '../../utils/escapeTelegrafMarkdown';

dotenv.config();

TelegramBot.use((ctx, next) => logger(ctx, next));
stage
    .command(commands.start.command, ctx => ctx.scene.enter('startScene'))
    .hears(commands.createPicture.command, ctx => ctx.scene.enter('generateByTextScene'))
    .hears(commands.stylingImage.command, ctx => ctx.scene.enter('generateByImageAndTextScene'))
    .hears(commands.help.command, ctx => {
        ctx.replyWithHTML(helpMessage(), { parse_mode: 'Markdown' });
    })
    .on('callback_query', ctx => {
        const callback = ctx.update && 'callback_query' in ctx.update ? ctx.update.callback_query : undefined;
        const callbackData = callback && 'data' in callback ? callback.data : '';
        if (callbackData === commands.alreadySubscribes.command) {
            checkIsGroupMember(ctx).then(isMember => {
                if (isMember) {
                    const { first_name } = ctx.from as ITGData;
                    ctx.replyWithHTML(greetingsMsg(escapeTelegrafMarkdown(first_name)), {
                        reply_markup: getMainMenu().reply_markup,
                        parse_mode: 'Markdown',
                    });
                }
            });
        } else {
            ctx.scene.enter('generateMoreOrUpscaleScene');
        }
    })
    .command(commands.exit.command, ctx => exitOfBot(ctx));

// bot.use(new sessionLocal({ database: 'data/localSession.json' }).middleware());
TelegramBot.use(session());
TelegramBot.use(stage.middleware());
TelegramBot.launch();

process.once('SIGINT', () => {
    TelegramBot.stop('SIGINT');
    process.exit();
});
process.once('SIGTERM', () => TelegramBot.stop('SIGTERM'));
