import * as dotenv from 'dotenv';
import { Scenes } from 'telegraf';
import { sendHasCompletedRequestMessage, sendSomethingWentWrong, sendWaitMessage } from '../../../utils/sendLoading';
import { checkIsGroupMember } from '../../../utils/checks/checkIsGroupMember';
import { findQueryInDB } from '../../../utils/db/saveQueryInDB';
import { addNewTransaction } from '../../../utils/db/saveTransactionsInDB';
import { ITGData } from '../../../types';

dotenv.config();

export const generateMoreOrUpscaleStep = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (!(await checkIsGroupMember(ctx))) return;
        //TODO добавить проверку на невыполненный запрос

        const callback = ctx.update && 'callback_query' in ctx.update ? ctx.update.callback_query : undefined;
        const callbackData = callback && 'data' in callback ? callback.data : '';

        //проверка если ты уже делал запрос
        const isHasCompletedRequest = await findQueryInDB({ action: callbackData });
        if (isHasCompletedRequest.result) return sendHasCompletedRequestMessage(ctx);

        const chatId = (ctx.from as ITGData).id.toString();
        const { message_id: waitMessageId } = await sendWaitMessage(ctx);
        await addNewTransaction({
            chatId,
            waitMessageId,
            action: callbackData,
        });
        return ctx.scene.leave();
    } catch (e) {
        console.error('generateMoreOrUpscaleStep -> catch', e);
        const chatId = (ctx.from as ITGData).id.toString();
        sendSomethingWentWrong(chatId);
        return ctx.scene.leave();
    }
};
