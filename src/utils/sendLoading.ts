import { Scenes } from 'telegraf';
import path from 'path';
import {
    badRequest,
    somethingWentWrong,
    hssOutstandingRequest,
    hssCompletedRequest,
    waitMessageDownloadPhoto,
    waitMessageWithProgress,
    waitMessage,
} from '../constants/messages';
import { getMainMenu } from '../constants/buttons';
import TelegramBot from '../setup/TelegramBot/init';

export const sendHasOutstandingRequestMessage = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        ctx.replyWithHTML(hssOutstandingRequest(), {
            parse_mode: 'Markdown',
        }).catch(e => console.error('sendHasOutstandingRequestMessage e ', e));
        return ctx.scene.leave();
    } catch (e) {
        console.error('sendHasOutstandingRequestMessage e', e);
        return ctx.scene.leave();
    }
};

export const sendHasCompletedRequestMessage = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        ctx.replyWithHTML(hssCompletedRequest(), {
            parse_mode: 'Markdown',
        }).catch(e => console.error('sendHasCompletedRequestMessage e ', e));

        return ctx.scene.leave();
    } catch (e) {
        console.error('sendHasCompletedRequestMessage e', e);
        return ctx.scene.leave();
    }
};

export const sendSomethingWentWrong = async (chatId: string) => {
    try {
        TelegramBot.telegram
            .sendMessage(chatId, somethingWentWrong(), {
                parse_mode: 'Markdown',
            })
            .catch(e => console.error('sendSomethingWentWrong e ', e));
    } catch (e) {
        console.error('sendSomethingWentWrong e', e);
    }
};

export const sendBadRequestMessage = async (chatId: string) => {
    try {
        TelegramBot.telegram
            .sendMessage(chatId, badRequest(), {
                parse_mode: 'Markdown',
            })
            .catch(e => console.error('sendBadRequestMessage e ', e));
    } catch (e) {
        console.error('sendBadRequestMessage e', e);
    }
};

export const sendWaitMessage = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) =>
    //https://i.yapx.ru/XFv9d.gif
    await ctx.replyWithDocument(
        {
            source: path.resolve(__dirname, '../static/loading.gif'),
            filename: 'loading.gif',
        },
        {
            parse_mode: 'Markdown',
            caption: waitMessage(),
        }
    );

export const sendLoadingMesage = (chatId: string, messageId: number, progress: string) => {
    try {
        TelegramBot.telegram
            .editMessageCaption(chatId, messageId, '0', waitMessageWithProgress(progress), {
                parse_mode: 'Markdown',
            })
            .catch(e => console.error('sendDownloadPhotoInProgressMesage e ', e));
    } catch (e) {
        console.error('sendDownloadPhotoInProgressMesage e ', e);
    }
};

export const sendDownloadPhotoInProgressMesage = (chatId: string, messageId: number) => {
    try {
        TelegramBot.telegram
            .editMessageCaption(chatId, messageId, '0', waitMessageDownloadPhoto(), {
                parse_mode: 'Markdown',
            })
            .catch(e => console.error('sendDownloadPhotoInProgressMesage e ', e));
    } catch (e) {
        console.error('sendDownloadPhotoInProgressMesage e ', e);
    }
};
