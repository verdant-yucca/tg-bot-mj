import { API } from '../../api';

export const getAvailableAccountMidjourney = async () => {
    try {
        return await API.availableAccountMidjourney.getAvailableAccountMidjourney();
    } catch (e) {
        console.error('не удалось получить записи getTransactions в бд', e);
        return { accounts: [] };
    }
};
