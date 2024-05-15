import * as dotenv from 'dotenv';
import { Scenes } from 'telegraf';
import {
    sendHasCompletedRequestMessage,
    sendHasOutstandingRequestMessage,
    sendSomethingWentWrong,
    sendWaitMessage
} from '../../../utils/sendLoading';
import { checkIsGroupMember } from '../../../utils/checks/checkIsGroupMember';
import { findQueryInDB } from '../../../utils/db/saveQueryInDB';
import { addNewTransaction, getFreeMidjourneyClient } from '../../../utils/db/saveTransactionsInDB';
import { ITGData } from '../../../types';
import _ from 'lodash';
import { checkHasRunningTransactions } from '../../../utils/checks/checkHasRunningTransactions';
import { getQuery } from '../../../api/query';
import { MidjourneyClient } from '../../MidjourneyClient';
import { checkHasAvailableQueries } from '../../../utils/checks/checkHasAvailableQueries';

dotenv.config();

export const generateMoreOrUpscaleStep = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (!(await checkIsGroupMember(ctx))) return;

        const session = ctx.session as { isHasOutstandingRequest?: boolean };
        console.log('session.isHasOutstandingRequest1', session.isHasOutstandingRequest);
        if (session?.isHasOutstandingRequest) return sendHasOutstandingRequestMessage(ctx);
        session.isHasOutstandingRequest = true;
        console.log('session.isHasOutstandingRequest2', session.isHasOutstandingRequest);

        const { isHasRunningTransactions, transactions } = await checkHasRunningTransactions(ctx);
        if (isHasRunningTransactions) return;

        const callback = ctx.update && 'callback_query' in ctx.update ? ctx.update.callback_query : undefined;
        const callbackData = callback && 'data' in callback ? callback.data : '';

        //проверка если ты уже делал запрос
        const isHasCompletedRequest = await findQueryInDB({ action: callbackData });
        const isHasCompletedRequestFromTransactions = transactions.some(
            ({ stage, action }) => stage === 'completed' && action === callbackData
        );
        if (isHasCompletedRequest.result || isHasCompletedRequestFromTransactions)
            return sendHasCompletedRequestMessage(ctx);

        const chatId = (ctx.from as ITGData).id.toString();
        const waitMessage = await sendWaitMessage(ctx).catch(e => _.noop);

        if (callbackData?.split('!!!')[1].includes('🔄') && !(await checkHasAvailableQueries(ctx))) return;

        const queryId = callbackData?.split('!!!')[0] || '';
        const { prompt, originPrompt, midjourneyClientId = '1' } = await getQuery({ queryId });

        const allClients = Object.keys(MidjourneyClient);
        if (!allClients.includes(midjourneyClientId)) {
            const chatId = (ctx.from as ITGData).id.toString();
            sendSomethingWentWrong(chatId);
            return ctx.scene.leave();
        }

        await addNewTransaction({
            chatId,
            translatedPrompt: prompt,
            originPrompt,
            waitMessageId: 'message_id' in waitMessage ? waitMessage.message_id : -1,
            action: callbackData,
            midjourneyClientId
        });
        session.isHasOutstandingRequest = false;
        console.log('session.isHasOutstandingRequest3', session.isHasOutstandingRequest);
        return ctx.scene.leave();
    } catch (e) {
        console.error('generateMoreOrUpscaleStep -> catch', e);
        const chatId = (ctx.from as ITGData).id.toString();

        const session = ctx.session as { isHasOutstandingRequest?: boolean };
        session.isHasOutstandingRequest = false;

        sendSomethingWentWrong(chatId);
        return ctx.scene.leave();
    }
};
