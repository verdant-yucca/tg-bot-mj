import { API } from '../../api';

export const addNewTransaction = async ({
    chatId,
    originPrompt,
    translatedPrompt,
    waitMessageId,
    discordMsgId,
    action,
}: {
    chatId: string;
    originPrompt?: string;
    translatedPrompt?: string;
    waitMessageId: number;
    discordMsgId?: string;
    action?: string;
}) => {
    try {
        return await API.transactions.addNewTransaction({
            chatId: chatId,
            prompt: translatedPrompt,
            originPrompt: originPrompt,
            discordMsgId,
            stage: 'waiting start',
            waitMessageId: waitMessageId.toString(),
            action,
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
}: ApiTypes.UpdateTransactionRequest) => {
    try {
        return await API.transactions.updateTransaction({ _id, buttons, discordMsgId, flags, action, stage });
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
export const deleteTransaction = async (_id: string) => {
    try {
        return await API.transactions.deleteTransaction(_id);
    } catch (e) {
        console.error('не удалось получить записи getTransactions в бд', e);
        return { transactions: [] };
    }
};
