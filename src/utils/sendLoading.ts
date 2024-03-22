import { Scenes } from 'telegraf';
import {
    badRequest,
    somethingWentWrong,
    hssOutstandingRequest,
    hssCompletedRequest,
    waitMessageDownloadPhoto, waitMessageWithProgress, waitMessage
} from '../constants/messages';
import { getMainMenu } from '../constants/buttons';
import path from 'path';

export const sendHasOutstandingRequestMessage = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    const wp = await ctx.replyWithHTML(hssOutstandingRequest(), {
        parse_mode: 'Markdown',
        reply_markup: getMainMenu().reply_markup
    });
    setTimeout(async () => {
        await ctx.deleteMessage(wp.message_id);
    }, 30000); // 60000 миллисекунд = 1 минута
    return ctx.scene.leave();
};

export const sendHasCompletedRequestMessage = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    ctx.replyWithHTML(hssCompletedRequest(), {
        parse_mode: 'Markdown',
        reply_markup: getMainMenu().reply_markup
    });
    return ctx.scene.leave();
};

export const sendSomethingWentWrong = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    const session = ctx.session as { isHasOutstandingRequest: boolean };
    session.isHasOutstandingRequest = false;
    ctx.replyWithHTML(somethingWentWrong(), {
        parse_mode: 'Markdown',
        reply_markup: getMainMenu().reply_markup
    });
    return ctx.scene.leave();
};

export const sendBadRequestMessage = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    const session = ctx.session as { isHasOutstandingRequest: boolean };
    session.isHasOutstandingRequest = false;
    ctx.replyWithHTML(badRequest(), { parse_mode: 'Markdown', reply_markup: getMainMenu().reply_markup });
    return ctx.scene.leave();
};

export const sendWaitMessage = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) =>
    //https://i.yapx.ru/XFv9d.gif
    await ctx.replyWithDocument(
        {
            source: path.resolve(__dirname, '../static/loading.gif'),
            filename: 'loading.gif'
        },
        {
            parse_mode: 'Markdown',
            caption: waitMessage()
        }
    );

export const sendLoadingMesage = (
    ctx: Scenes.WizardContext<Scenes.WizardSessionData>,
    message: any,
    progress: string
) => {
    ctx.telegram.editMessageCaption(
        message.chat.id,
        message.message_id,
        '0',
        waitMessageWithProgress(progress),
        { parse_mode: 'Markdown' }
    );
};

export const sendDownloadPhotoInProgressMesage = (
    ctx: Scenes.WizardContext<Scenes.WizardSessionData>,
    message: any
) => {
    ctx.telegram.editMessageCaption(
        message.chat.id,
        message.message_id,
        '0',
        waitMessageDownloadPhoto(),
        { parse_mode: 'Markdown' }
    );
};
