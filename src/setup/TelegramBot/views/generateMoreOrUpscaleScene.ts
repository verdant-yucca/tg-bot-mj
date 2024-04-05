import * as dotenv from 'dotenv';
import { Scenes } from 'telegraf';
import { sendHasCompletedRequestMessage, sendSomethingWentWrong, sendWaitMessage } from '../../../utils/sendLoading';
import { checkIsGroupMember } from '../../../utils/checks/checkIsGroupMember';
import { findQueryInDB } from '../../../utils/db/saveQueryInDB';
import { addNewTransaction, getFreeMidjourneyClient } from '../../../utils/db/saveTransactionsInDB';
import { ITGData } from '../../../types';
import _ from 'lodash';
import { checkHasRunningTransactions } from '../../../utils/checks/checkHasRunningTransactions';
import { getQuery } from '../../../api/query';

dotenv.config();

export const generateMoreOrUpscaleStep = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (!(await checkIsGroupMember(ctx))) return;
        if (await checkHasRunningTransactions(ctx)) return;

        const callback = ctx.update && 'callback_query' in ctx.update ? ctx.update.callback_query : undefined;
        const callbackData = callback && 'data' in callback ? callback.data : '';

        //проверка если ты уже делал запрос
        const isHasCompletedRequest = await findQueryInDB({ action: callbackData });
        if (isHasCompletedRequest.result) return sendHasCompletedRequestMessage(ctx);

        const chatId = (ctx.from as ITGData).id.toString();
        const waitMessage = await sendWaitMessage(ctx).catch(e => _.noop);

        const queryId = callbackData?.split('!!!')[0] || '';
        const { prompt, originPrompt, midjourneyClientId = '1' } = await getQuery({ queryId });
        await addNewTransaction({
            chatId,
            translatedPrompt: prompt,
            originPrompt,
            waitMessageId: 'message_id' in waitMessage ? waitMessage.message_id : -1,
            action: callbackData,
            midjourneyClientId,
        });

        return ctx.scene.leave();
    } catch (e) {
        console.error('generateMoreOrUpscaleStep -> catch', e);
        const chatId = (ctx.from as ITGData).id.toString();
        sendSomethingWentWrong(chatId);
        return ctx.scene.leave();
    }
};
