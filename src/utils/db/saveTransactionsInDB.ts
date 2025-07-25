import { API } from '../../api';
import { MidjourneyClient } from '../../setup/MidjourneyClient';

export const addNewTransaction = async ({
                                            chatId,
                                            originPrompt,
                                            translatedPrompt,
                                            waitMessageId,
                                            discordMsgId,
                                            action,
                                            midjourneyClientId
                                        }: {
    chatId: string;
    originPrompt?: string;
    translatedPrompt?: string;
    waitMessageId: number;
    discordMsgId?: string;
    action?: string;
    midjourneyClientId?: string;
}) => {
    try {
        return await API.transactions.addNewTransaction({
            chatId: chatId,
            prompt: translatedPrompt,
            originPrompt: originPrompt,
            discordMsgId,
            midjourneyClientId,
            stage: 'waiting start',
            waitMessageId: waitMessageId.toString(),
            action
        });
    } catch (e) {
        console.error('не удалось сохранить запрос в бд');
        return { _id: '' };
    }
};

export const updateTransaction = async ({
                                            _id,
                                            buttons,
                                            discordMsgId,
                                            flags,
                                            action,
                                            stage,
                                            originPrompt,
                                            prompt
                                        }: ApiTypes.UpdateTransactionRequest) => {
    try {
        return await API.transactions.updateTransaction({
            _id,
            buttons,
            discordMsgId,
            flags,
            action,
            stage,
            originPrompt,
            prompt
        });
    } catch (e) {
        console.error('не удалось обновить запись updateTransaction в бд', e);
    }
};

export const getTransactions = async () => {
    try {
        return await API.transactions.getTransactions();
    } catch (e) {
        console.error('не удалось получить записи getTransactions в бд', e);
        return { transactions: [] };
    }
};

export const getTransactionsByUserId = async (chatId: string) => {
    try {
        return await API.transactions.getTransactionsByUserId(chatId);
    } catch (e) {
        console.error('не удалось получить записи getTransactionsByUserId в бд', e);
        return { transactions: [] };
    }
};

export const deleteTransaction = async (_id: string) => {
    try {
        return await API.transactions.deleteTransaction(_id);
    } catch (e) {
        console.error('не удалось получить записи getTransactions в бд', e);
        return { transactions: [] };
    }
};

export const getFreeMidjourneyClient = async () => {
    try {
        const { transactions } = await getTransactions();
        const filteredTransactions = transactions
            .filter(
                ({ stage, midjourneyClientId }) => stage === 'running' || (stage === 'completed' && midjourneyClientId)
            )
            .map(({ midjourneyClientId, stage }) => ({ midjourneyClientId, stage }));
        const allClients = Object.keys(MidjourneyClient);
        const initObj: Record<string, number> = {};
        allClients.forEach((key) => {
            initObj[key] = 0;
        });

        const result = filteredTransactions.reduce(
            (acc, { midjourneyClientId, stage }) => {
                if (typeof acc[midjourneyClientId] !== 'undefined') {
                    acc[midjourneyClientId] = (acc[midjourneyClientId] || 0) + 1;
                }
                return acc;
            },
            initObj
        );

        // Найдем клиент с наименьшей очередью
        let minClientId = Object.keys(result)[0];
        let minValue = Infinity;
        for (const clientId in result) {
            if (result[clientId] < minValue) {
                minValue = result[clientId];
                minClientId = clientId;
            }
        }

        return minClientId;
    } catch (e) {
        console.error('не удалось получить getFreeMidjourneyClient из бд', e);
        return '1';
    }
};
