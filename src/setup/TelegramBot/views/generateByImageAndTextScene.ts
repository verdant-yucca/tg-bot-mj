import { Scenes } from 'telegraf';
import { sendSomethingWentWrong, sendWaitMessage } from '../../../utils/sendLoading';
import { checkIsGroupMember } from '../../../utils/checks/checkIsGroupMember';
import { messageEnterImageForStylingImage, messageEnterTextForStylingImage } from '../../../constants/messages';
import { checkHasAvailableQueries } from '../../../utils/checks/checkHasAvailableQueries';
import { getAndSaveImage } from '../../../utils/getAndSaveImage';
import { getTranslatedPrompt } from '../../../utils/getTranslatedPrompt';
import { ITGData } from '../../../types';
import { addNewTransaction } from '../../../utils/db/saveTransactionsInDB';

export const enterYourImageStep1 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
            const chatId = (ctx.from as ITGData).id.toString();
            sendSomethingWentWrong(chatId);
            return ctx.scene.leave();
        }
        if (!(await checkIsGroupMember(ctx))) return;
        if (!(await checkHasAvailableQueries(ctx))) return;
        //TODO добавить проверку на невыполненный запрос
        ctx.replyWithHTML(messageEnterImageForStylingImage(), { parse_mode: 'Markdown' });
        ctx.wizard.next();
    } catch (e) {
        console.error('generateByImageAndText -> enterYourImageStep1 -> catch', e);
        const chatId = (ctx.from as ITGData).id.toString();
        sendSomethingWentWrong(chatId);
        return ctx.scene.leave();
    }
};

export const enterYourTextStep2 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const chatId = (ctx.from as ITGData).id.toString();
        const state = ctx.session as { imageUrl?: string };
        state.imageUrl = await getAndSaveImage(ctx);

        if (state.imageUrl) {
            ctx.replyWithHTML(messageEnterTextForStylingImage(), { parse_mode: 'Markdown' });
            ctx.wizard.next();
        } else {
            console.error('generateByImageAndText -> enterYourTextStep2 -> видимо в сообщении нет фотки', ctx);
            return sendSomethingWentWrong(chatId);
        }
    } catch (e) {
        console.error('generateByImageAndText -> enterYourTextStep2 -> catch', e);
        const chatId = (ctx.from as ITGData).id.toString();
        sendSomethingWentWrong(chatId);
        return ctx.scene.leave();
    }
};

export const stylingImageByTextStep3 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const { imageUrl } = ctx.session as { imageUrl?: string };
        const { translatedPrompt, originPrompt } = await getTranslatedPrompt(ctx);
        const { message_id: waitMessageId } = await sendWaitMessage(ctx);

        const chatId = (ctx.from as ITGData).id.toString();
        await addNewTransaction({
            chatId,
            translatedPrompt: `${imageUrl} ${translatedPrompt}`,
            originPrompt: `${imageUrl} ${originPrompt}`,
            waitMessageId,
            action: 'stylingImageByText',
        });
        return ctx.scene.leave();
    } catch (e) {
        console.error('generateByImageAndText -> catch', e);
        const chatId = (ctx.from as ITGData).id.toString();
        sendSomethingWentWrong(chatId);
        return ctx.scene.leave();
    }
};
