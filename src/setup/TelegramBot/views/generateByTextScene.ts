import { Scenes } from 'telegraf';
import { sendBadRequestMessage, sendSomethingWentWrong, sendWaitMessage } from '../../../utils/sendLoading';
import { checkHasLinkInText } from '../../../utils/checks/checkHasLinkInText';
import { checkHasAvailableQueries } from '../../../utils/checks/checkHasAvailableQueries';
import { checkIsGroupMember } from '../../../utils/checks/checkIsGroupMember';
import { messageEnterYourTextForGenerateImage } from '../../../constants/messages';
import { getTranslatedPrompt } from '../../../utils/getTranslatedPrompt';
import { addNewTransaction, getFreeMidjourneyClient } from '../../../utils/db/saveTransactionsInDB';
import { ITGData } from '../../../types';
import { checkIsBadPrompt } from '../../../utils/checks/checkIsBadRequest';
import { checkHasRunningTransactions } from '../../../utils/checks/checkHasRunningTransactions';
import { getUserByIdFromDb } from '../../../utils/db/saveUserInDb';

export const enterYourTextStep1 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
            const chatId = (ctx.from as ITGData).id.toString();
            sendSomethingWentWrong(chatId);
            return ctx.scene.leave();
        }
        if (!(await checkIsGroupMember(ctx))) return;
        if (!(await checkHasAvailableQueries(ctx))) return;
        const { isHasRunningTransactions, transactions } = await checkHasRunningTransactions(ctx);
        if (isHasRunningTransactions) return;
        ctx.replyWithHTML(messageEnterYourTextForGenerateImage(), { parse_mode: 'Markdown' });
        ctx.wizard.next();
    } catch (e) {
        console.error('generateByText -> enterYourTextStep1 -> catch', e);
        const chatId = (ctx.from as ITGData).id.toString();
        sendSomethingWentWrong(chatId);
        return ctx.scene.leave();
    }
};

export const generateImageByTextStep2 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (checkHasLinkInText(ctx)) return;
        const { translatedPrompt, originPrompt } = await getTranslatedPrompt(ctx);
        const chatId = (ctx.from as ITGData).id.toString();

        if (checkIsBadPrompt(translatedPrompt)) {
            sendBadRequestMessage(chatId);
            return ctx.scene.leave();
        }

        // const waitMessage = await sendWaitMessage(ctx).catch(e => _.noop);
        const waitMessage = await sendWaitMessage(ctx).catch(e => console.error('eeeeeeeeeeeeeeeeeeee', e));
        const midjourneyClientId = await getFreeMidjourneyClient();
        const { selectedStyle, selectedSize } = await getUserByIdFromDb(ctx);
        const currentStyle = selectedStyle && selectedStyle !== 'Без стиля' ? selectedStyle : '';
        const currentSize = selectedSize && selectedSize !== 'Без формата' ? selectedSize : '';
        await addNewTransaction({
            chatId,
            translatedPrompt: `${translatedPrompt}${currentStyle}${currentSize}`,
            originPrompt: `${originPrompt}${currentStyle}${currentSize}`,
            waitMessageId: waitMessage && 'message_id' in waitMessage ? waitMessage.message_id : -1,
            midjourneyClientId: midjourneyClientId || '-1',
            action: 'generateImageByText',
        });
        return ctx.scene.leave();
    } catch (e) {
        console.error('generateByText -> catch ', e);
        const chatId = (ctx.from as ITGData).id.toString();
        sendSomethingWentWrong(chatId);
        return ctx.scene.leave();
    }
};
