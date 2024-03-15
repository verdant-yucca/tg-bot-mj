import { Markup, Scenes } from 'telegraf';
import { MJMessage } from 'midjourney';
import { client } from '../setup/bot';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../utils/getButtonsForFourPhoto';
import {
    sendBadRequestMessage,
    sendDownloadPhotoInProgressMesage,
    sendLoadingMesage,
    sendSomethingWentWrong,
    sendWaitMessage
} from '../utils/sendLoading';
import { saveQueryInDB, updateQueryInDB } from '../utils';
import { checkHasLinkInText } from '../utils/checkHasLinkInText';
import { checkIsGroupMember } from '../utils/checkIsGroupMember';

export const enterYourTextStep1 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return sendSomethingWentWrong(ctx);
        if (!await checkIsGroupMember(ctx)) return;
        ctx.replyWithHTML('Введите свой запрос:');
        ctx.wizard.next();
    } catch (e) {
        console.error('Error msg', e);
        return sendSomethingWentWrong(ctx);
    }
};
export const generateImageByTextStep2 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const tgMessage = 'message' in ctx.update ? ctx.update.message : undefined;
        const textTgMessage = tgMessage && 'text' in tgMessage ? tgMessage.text : undefined;
        const prompt = textTgMessage || '';
        if (checkHasLinkInText(ctx, prompt)) return;
        const waitMessage = await sendWaitMessage(ctx);
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

                updateQueryInDB({
                    _id,
                    buttons: JSON.stringify(getDataButtonsForFourPhoto(Imagine)),
                    discordMsgId: Imagine.id || '',
                    flags: Imagine.flags.toString()
                });

                ctx.scene.leave();
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
