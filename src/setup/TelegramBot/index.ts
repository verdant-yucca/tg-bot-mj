import { session } from 'telegraf';
import * as dotenv from 'dotenv';
import { commands } from '../../constants/bot';
import { stage } from './scenes';
import { exitOfBot } from '../../utils/telegramHelpers';
import { logger } from '../../middlewares';
import {
    greetingsMsg,
    helpMessage,
    package1,
    package2,
    package3,
    package4,
    successfulPaymentMessage,
} from '../../constants/messages';
import { getMainMenu } from '../../constants/buttons';
import { ITGData } from '../../types';
import { checkIsGroupMember } from '../../utils/checks/checkIsGroupMember';
import TelegramBot from './init';
import { escapeTelegrafMarkdown } from '../../utils/escapeTelegrafMarkdown';
import { paymentsScene } from './views/payments';
import { getUserByIdFromDb, updateUserInDb } from '../../utils/db/saveUserInDb';
import {
    backToSettingsMenu,
    sendPaymentsMenu,
    sendSizesMenu,
    sendStylesMenu,
    updateSizesMenu,
    updateStylesMenu,
} from './views/settingsScene';

dotenv.config();

TelegramBot.use((ctx, next) => logger(ctx, next));
stage
    .command(commands.start.command, ctx => ctx.scene.enter('startScene'))
    .hears(commands.createPicture.command, ctx => ctx.scene.enter('generateByTextScene'))
    .hears(commands.stylingImage.command, ctx => ctx.scene.enter('generateByImageAndTextScene'))
    .hears(commands.settings.command, ctx => ctx.scene.enter('settingsScene'))
    .hears(commands.help.command, ctx => {
        ctx.replyWithHTML(helpMessage(), { parse_mode: 'Markdown' });
    })
    .on('pre_checkout_query', ctx => {
        ctx.answerPreCheckoutQuery(true);
    }) // ответ на предварительный запрос по оплате

    .on('successful_payment', async (ctx, next) => {
        // ответ в случае положительной оплаты
        const payload = ctx.update.message.successful_payment.invoice_payload as string;
        const { price, count, packageName } = JSON.parse(payload) as unknown as {
            packageName: string;
            price: string;
            count: string;
        };
        await ctx.reply(successfulPaymentMessage({ count, packageName, price }));
        updateUserInDb(ctx, {
            payments: [{ count, price, date: new Date().toLocaleString() }],
        });
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
        } else if (callbackData === package1()) {
            paymentsScene(ctx, 0);
        } else if (callbackData === package2()) {
            paymentsScene(ctx, 1);
        } else if (callbackData === package3()) {
            paymentsScene(ctx, 2);
        } else if (callbackData === package4()) {
            paymentsScene(ctx, 3);
        } else if (callbackData === commands.settings.command) {
            backToSettingsMenu(ctx);
        } else if (callbackData === 'Выбрать стиль') {
            sendStylesMenu(ctx);
        } else if (callbackData === 'Выбрать размер') {
            sendSizesMenu(ctx);
        } else if (callbackData === 'Купить запросы') {
            sendPaymentsMenu(ctx);
        } else if (/setStyles!!!/.test(callbackData)) {
            updateStylesMenu(ctx);
        } else if (/setSizes!!!/.test(callbackData)) {
            updateSizesMenu(ctx);
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
