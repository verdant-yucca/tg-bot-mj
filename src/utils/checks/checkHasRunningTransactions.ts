import { Scenes } from 'telegraf';
import { getTransactionsByUserId } from '../db/saveTransactionsInDB';
import { ITGData } from '../../types';
import { hssOutstandingRequest } from '../../constants/messages';

export const checkHasRunningTransactions = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>): Promise<{ isHasRunningTransactions: boolean; transactions: ApiTypes.Transaction[] }> => {
    try {
        const { id: chatId } = ctx.from as ITGData;
        const { transactions } = await getTransactionsByUserId(chatId.toString());
        const isHasRunningTransactions = transactions.some(
            ({ stage }) => stage === 'waiting start' || stage === 'running'
        );

        if (isHasRunningTransactions) {
            ctx.replyWithHTML(hssOutstandingRequest(), {
                parse_mode: 'Markdown'
            });
            ctx.scene.leave();
        }
        return { isHasRunningTransactions, transactions };
    } catch (e) {
        console.error('checkHasAvailableQueries -> catch e', e);
        return { isHasRunningTransactions: true, transactions: [] };
    }
};
