import { Markup, Scenes } from 'telegraf';
import { client } from '../../setup/bot';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../../utils/getButtonsForFourPhoto';
import {
    sendBadRequestMessage,
    sendDownloadPhotoInProgressMesage,
    sendLoadingMesage,
    sendSomethingWentWrong,
    sendWaitMessage,
} from '../../utils/sendLoading';
import { saveQueryInDB, updateQueryInDB } from '../../utils';
import { checkHasLinkInText } from '../../utils/checkHasLinkInText';

export const enterYourTextStep1 = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return sendSomethingWentWrong(ctx);
        ctx.replyWithHTML('Введите свой запрос:');
        ctx.wizard.next();
    } catch (err) {
        console.error('Error msg', err.message);
        return sendSomethingWentWrong(ctx);
    }
};
export const generateImageByTextStep2 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const prompt = ctx.update.message.text as string;
        if (checkHasLinkInText(ctx, prompt)) return;
        const waitMessage = await sendWaitMessage(ctx);
        const { _id } = await saveQueryInDB(ctx, prompt);

        client
            .Imagine(prompt, (uri: string, progress: string) => sendLoadingMesage(ctx, waitMessage, progress))
            .then(Imagine => {
                if (!Imagine) return sendSomethingWentWrong(ctx);
                sendDownloadPhotoInProgressMesage(ctx, waitMessage);

                ctx.replyWithPhoto({ url: Imagine.uri }, Markup.inlineKeyboard(getButtonsForFourPhoto(_id))).then(
                    () => {
                        ctx.deleteMessage(waitMessage.message_id);
                    },
                );

                const sessionData = ctx.session as { withoutFirstStep: boolean };
                sessionData.withoutFirstStep = true;
                updateQueryInDB({
                    _id,
                    buttons: JSON.stringify(getDataButtonsForFourPhoto(Imagine)),
                    discordMsgId: Imagine.id || '',
                    flags: Imagine.flags.toString(),
                });

                ctx.scene.leave();
                ctx.scene.enter('generateMoreOrUpscaleScene');
            })
            .catch(e => {
                ctx.deleteMessage(waitMessage.message_id);
                return sendBadRequestMessage(ctx);
            });
    } catch (err) {
        console.error('Error msg', err.message);
        return sendSomethingWentWrong(ctx);
    }
};
