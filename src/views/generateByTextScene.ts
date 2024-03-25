import { Markup, Scenes } from 'telegraf';
import { MJMessage } from 'midjourney';
import { client } from '../setup/bot';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../utils/getButtonsForFourPhoto';
import {
    sendBadRequestMessage,
    sendDownloadPhotoInProgressMesage, sendHasOutstandingRequestMessage,
    sendLoadingMesage,
    sendSomethingWentWrong,
    sendWaitMessage
} from '../utils/sendLoading';
import { saveQueryInDB, updateQueryInDB } from '../utils';
import { checkHasLinkInText } from '../utils/checkHasLinkInText';
import { checkIsGroupMember } from '../utils/checkIsGroupMember';
import { getTranslatePrompt } from '../utils/getTranslatePrompt';
import { messageEnterYourTextForGenerateImage } from '../constants/messages';

export const enterYourTextStep1 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return sendSomethingWentWrong(ctx);
        if (!await checkIsGroupMember(ctx)) return;
        const session = ctx.session as { isHasOutstandingRequest: boolean };
        if (session.isHasOutstandingRequest) return sendHasOutstandingRequestMessage(ctx);
        ctx.replyWithHTML(messageEnterYourTextForGenerateImage(), { parse_mode: 'Markdown' });
        ctx.wizard.next();
    } catch (e) {
        console.error('Error msg', e);
        return sendSomethingWentWrong(ctx);
    }
};
export const generateImageByTextStep2 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const tgMessage = 'message' in ctx.update ? ctx.update.message : undefined;
        const textTgMessage = tgMessage && 'text' in tgMessage ? tgMessage.text : '';
        let translatedTgMessage = textTgMessage;
        console.log('text before: ', translatedTgMessage);
        if (textTgMessage) {
            translatedTgMessage = await getTranslatePrompt(textTgMessage);
            console.log('text after: ', translatedTgMessage);
        }
        const prompt = translatedTgMessage;
        if (checkHasLinkInText(ctx, prompt)) return;
        const waitMessage = await sendWaitMessage(ctx);
        const { _id } = await saveQueryInDB(ctx, prompt);

        client
            .Imagine(prompt, (uri: string, progress: string) => sendLoadingMesage(ctx, waitMessage, progress))
            .then((Imagine: MJMessage | null) => {
                if (!Imagine) return sendSomethingWentWrong(ctx);
                sendDownloadPhotoInProgressMesage(ctx, waitMessage);

                ctx.replyWithPhoto({ url: Imagine.uri }, {
                    reply_markup: Markup.inlineKeyboard(getButtonsForFourPhoto(_id)).reply_markup,
                    parse_mode: 'Markdown'
                }).then(
                    () => {
                        ctx.deleteMessage(waitMessage.message_id);
                    }
                );

                updateQueryInDB({
                    _id,
                    action: 'generateImageByText',
                    buttons: JSON.stringify(getDataButtonsForFourPhoto(Imagine)),
                    discordMsgId: Imagine.id || '',
                    flags: Imagine.flags.toString()
                }, ctx);

                return ctx.scene.leave();
            })
            .catch((e) => {
                console.log(e);
                updateQueryInDB({
                    _id,
                    action: 'badRequest',
                    buttons: '',
                    discordMsgId: '',
                    flags: ''
                }, ctx);
                ctx.deleteMessage(waitMessage.message_id);
                return sendBadRequestMessage(ctx);
            });
    } catch (e) {
        console.error('Error msg', e);
        return sendSomethingWentWrong(ctx);
    }
};
