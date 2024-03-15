import { Markup, Scenes } from 'telegraf';
import { MJMessage } from 'midjourney';
import { client } from '../setup/bot';
import { saveQueryInDB, getUrlPhotoFromMessage, getButtonsForFourPhoto, updateQueryInDB } from '../utils';
import {
    sendBadRequestMessage,
    sendDownloadPhotoInProgressMesage,
    sendLoadingMesage,
    sendSomethingWentWrong,
    sendWaitMessage
} from '../utils/sendLoading';
import { getDataButtonsForFourPhoto } from '../utils/getButtonsForFourPhoto';

export const enterYourImageStep1 = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return sendSomethingWentWrong(ctx);
        ctx.replyWithHTML('Отправьте изображение или ссылку на изображение, которое хотите стилизовать:');
        ctx.wizard.next();
    } catch (e) {
        console.error('Error msg', e);
        return sendSomethingWentWrong(ctx);
    }
};

export const enterYourTextStep2 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) sendSomethingWentWrong(ctx);

        const firstUrlImage = await getUrlPhotoFromMessage(ctx);
        if (!firstUrlImage) return sendSomethingWentWrong(ctx);
        const state = ctx.session as { firstUrlImage?: string };
        state.firstUrlImage = firstUrlImage;
        ctx.replyWithHTML('Отправьте второе изображение или ссылку:');
        ctx.wizard.next();
    } catch (e) {
        console.error('Error msg', e);
        return sendSomethingWentWrong(ctx);
    }
};

export const stylingImageByTextStep3 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const { firstUrlImage } = ctx.session as { firstUrlImage?: string };
        const secondUrlImage = await getUrlPhotoFromMessage(ctx);
        if (!secondUrlImage) return sendSomethingWentWrong(ctx);
        const waitMessage = await sendWaitMessage(ctx);
        const prompt = `${firstUrlImage} ${secondUrlImage}`;
        const { _id } = await saveQueryInDB(ctx, prompt);

        client
            .Imagine(prompt, (uri: string, progress: string) => sendLoadingMesage(ctx, waitMessage, progress))
            .then((Imagine: MJMessage | null) => {
                if (!Imagine) return sendSomethingWentWrong(ctx);
                sendDownloadPhotoInProgressMesage(ctx, waitMessage);
                ctx.replyWithPhoto({ url: Imagine.uri }, Markup.inlineKeyboard(getButtonsForFourPhoto(_id))).then(
                    () => {
                        ctx.deleteMessage(waitMessage.message_id);
                    }
                );

                const dataButtons = JSON.stringify(getDataButtonsForFourPhoto(Imagine));
                updateQueryInDB({
                    _id,
                    buttons: dataButtons,
                    discordMsgId: Imagine.id || '',
                    flags: Imagine.flags.toString()
                });

                ctx.scene.leave();
                ctx.scene.enter('generateMoreOrUpscaleScene');
            })
            .catch(() => {
                ctx.deleteMessage(waitMessage.message_id);
                return sendBadRequestMessage(ctx);
            });
    } catch (e) {
        console.error('Error msg', e);
        return sendSomethingWentWrong(ctx);
    }
};
