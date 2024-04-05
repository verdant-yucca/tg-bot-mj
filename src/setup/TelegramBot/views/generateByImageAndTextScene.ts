import { Scenes } from 'telegraf';
import { sendBadRequestMessage, sendSomethingWentWrong, sendWaitMessage } from '../../../utils/sendLoading';
import { checkIsGroupMember } from '../../../utils/checks/checkIsGroupMember';
import { messageEnterImageForStylingImage, messageEnterTextForStylingImage } from '../../../constants/messages';
import { checkHasAvailableQueries } from '../../../utils/checks/checkHasAvailableQueries';
import { getAndSaveImage } from '../../../utils/getAndSaveImage';
import { getTranslatedPrompt } from '../../../utils/getTranslatedPrompt';
import { ITGData } from '../../../types';
import { addNewTransaction, getFreeMidjourneyClient } from '../../../utils/db/saveTransactionsInDB';
import _ from 'lodash';
import { checkIsBadPrompt } from '../../../utils/checks/checkIsBadRequest';
import { checkHasRunningTransactions } from '../../../utils/checks/checkHasRunningTransactions';
import { getUserByIdFromDb } from '../../../utils/db/saveUserInDb';

export const enterYourImageStep1 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
            const chatId = (ctx.from as ITGData).id.toString();
            sendSomethingWentWrong(chatId);
            return ctx.scene.leave();
        }
        if (!(await checkIsGroupMember(ctx))) return;
        if (!(await checkHasAvailableQueries(ctx))) return;
        if (await checkHasRunningTransactions(ctx)) return;
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
        const chatId = (ctx.from as ITGData).id.toString();

        if (checkIsBadPrompt(translatedPrompt)) {
            sendBadRequestMessage(chatId);
            return ctx.scene.leave();
        }

        const { selectedStyle, selectedSize } = await getUserByIdFromDb(ctx);
        const waitMessage = await sendWaitMessage(ctx).catch(e => _.noop);
        const midjourneyClientId = await getFreeMidjourneyClient();
        await addNewTransaction({
            chatId,
            translatedPrompt: `${imageUrl} ${translatedPrompt}${
                selectedStyle && selectedStyle !== 'Без стиля' ? selectedStyle : ''
            }${selectedSize && selectedSize !== 'Без формата' ? selectedSize : ''}`,
            originPrompt: `${imageUrl} ${originPrompt}${
                selectedStyle && selectedStyle !== 'Без стиля' ? selectedStyle : ''
            }${selectedSize && selectedSize !== 'Без формата' ? selectedSize : ''}`,
            waitMessageId: 'message_id' in waitMessage ? waitMessage.message_id : -1,
            midjourneyClientId,
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
