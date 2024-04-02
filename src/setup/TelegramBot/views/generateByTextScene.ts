import { Scenes } from 'telegraf';
import { sendSomethingWentWrong, sendWaitMessage } from '../../../utils/sendLoading';
import { checkHasLinkInText } from '../../../utils/checks/checkHasLinkInText';
import { checkHasAvailableQueries } from '../../../utils/checks/checkHasAvailableQueries';
import { checkIsGroupMember } from '../../../utils/checks/checkIsGroupMember';
import { messageEnterYourTextForGenerateImage } from '../../../constants/messages';
import { getTranslatedPrompt } from '../../../utils/getTranslatedPrompt';
import { addNewTransaction } from '../../../utils/db/saveTransactionsInDB';
import { ITGData } from '../../../types';

export const enterYourTextStep1 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
            const chatId = (ctx.from as ITGData).id.toString();
            sendSomethingWentWrong(chatId);
            return ctx.scene.leave();
        }
        if (!(await checkIsGroupMember(ctx))) return;
        if (!(await checkHasAvailableQueries(ctx))) return;
        //TODO добавить проверку на невыполненный запрос
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
        const { message_id: waitMessageId } = await sendWaitMessage(ctx);
        const chatId = (ctx.from as ITGData).id.toString();
        await addNewTransaction({
            chatId,
            translatedPrompt,
            originPrompt,
            waitMessageId,
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
