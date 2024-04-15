import cron from 'node-cron';
import { deleteTransaction, getTransactions } from '../../utils/db/saveTransactionsInDB';
import { newImagine } from '../MidjourneyClient/queries/newImagine';
import { newReroll } from '../MidjourneyClient/queries/newReroll';
import { newUpscale } from '../MidjourneyClient/queries/newUpscale';
import { newVariation } from '../MidjourneyClient/queries/newVariation';
import { saveQueryInDB } from '../../utils/db/saveQueryInDB';
import TelegramBot from '../TelegramBot/init';
import { countFreeRequest, waitMessageWithQuines } from '../../constants/messages';
import _ from 'lodash';
import { updateCountFreeQueriesForAllUsers } from '../../api/users';

const LIMIT = 3;

cron.schedule('0 0 * * *', async () => {
    try {
        console.log('start cron job');
        updateCountFreeQueriesForAllUsers(countFreeRequest());
    } catch (e) {
        console.log(e);
    }
});

// проверка очереди каждые 10 секунд
cron.schedule('*/10 * * * * *', async () => {
    console.log('Проверка записей в базе данных...');
    const { transactions } = await getTransactions();
    const waitingStartTransactions = transactions
        .filter(({ stage }) => stage === 'waiting start')
        .sort((a, b) => {
            if (a.dateQuery < b.dateQuery) {
                return -1;
            }
            if (a.dateQuery > b.dateQuery) {
                return 1;
            }
            return 0;
        });

    const runningTransactions = transactions.filter(({ stage }) => stage === 'running');
    const runningTransactionsClient1 = runningTransactions.filter(
        ({ midjourneyClientId }) => midjourneyClientId === '1'
    );
    const runningTransactionsClient2 = runningTransactions.filter(
        ({ midjourneyClientId }) => midjourneyClientId === '2'
    );
    const runningTransactionsClient3 = runningTransactions.filter(
        ({ midjourneyClientId }) => midjourneyClientId === '3'
    );

    const waitingStartTransactionsClient1 = waitingStartTransactions.filter(
        ({ midjourneyClientId }) => midjourneyClientId === '1'
    );
    const waitingStartTransactionsClient2 = waitingStartTransactions.filter(
        ({ midjourneyClientId }) => midjourneyClientId === '2'
    );
    const waitingStartTransactionsClient3 = waitingStartTransactions.filter(
        ({ midjourneyClientId }) => midjourneyClientId === '3'
    );
    const completedTransactions = transactions.filter(({ stage }) => stage === 'completed');
    const badRequestTransactions = transactions.filter(({ stage }) => stage === 'badRequest');
    //если есть выполненные транзакции, их нужно переместить в базу queries - выполненные
    if (completedTransactions.length) {
        completedTransactions.forEach(transaction => {
            //1. добавить в queries
            saveQueryInDB(transaction).then(() => {
                //2. удалить из transactions
                deleteTransaction(transaction._id);
            });
        });
    }
    //если есть транзакции в статусе badRequest, их нужно удалить
    if (badRequestTransactions.length) {
        badRequestTransactions.forEach(transaction => {
            // удалить из transactions
            deleteTransaction(transaction._id);
        });
    }
    // //если есть ожидающие запуска и запущено меньше 3, то запускаем ещё
    // if (waitingStartTransactionsClient1.length && runningTransactionsClient1.length < LIMIT) {
    //     const availableLimitTransactionsForStart = LIMIT - runningTransactionsClient1.length;
    //     for (let i = 0; i < availableLimitTransactionsForStart; i++) {
    //         const transaction = waitingStartTransactionsClient1[i];
    //         if (transaction?.action === 'generateImageByText' || transaction?.action === 'stylingImageByText') {
    //             const { prompt, _id, waitMessageId, chatId, midjourneyClientId } = transaction;
    //             newImagine({ prompt, _id, waitMessageId: +waitMessageId, chatId, midjourneyClientId });
    //         } else if (transaction?.action === 'failed' || transaction?.action === 'badRequest') {
    //             //хз пока, наверное запустить по новой
    //         } else if (transaction?.action && transaction.action.includes('!!!')) {
    //             if (
    //                 transaction.action.includes('U1') ||
    //                 transaction.action.includes('U2') ||
    //                 transaction.action.includes('U3') ||
    //                 transaction.action.includes('U4')
    //             ) {
    //                 newUpscale(transaction);
    //             } else if (
    //                 transaction.action.includes('V1') ||
    //                 transaction.action.includes('V2') ||
    //                 transaction.action.includes('V3') ||
    //                 transaction.action.includes('V4')
    //             ) {
    //                 newVariation(transaction);
    //             } else {
    //                 newReroll(transaction);
    //             }
    //         }
    //     }
    //
    //     for (let i = availableLimitTransactionsForStart; i < waitingStartTransactions.length; i++) {
    //         const { chatId, waitMessageId } = waitingStartTransactionsClient1[i] || {};
    //         TelegramBot.telegram
    //             .editMessageCaption(chatId, +waitMessageId, '0', waitMessageWithQuines(i.toString()))
    //             .catch(() => _.noop);
    //     }
    // }
    //
    // //если есть ожидающие запуска и запущено меньше 3, то запускаем ещё
    // if (waitingStartTransactionsClient2.length && runningTransactionsClient2.length < LIMIT) {
    //     const availableLimitTransactionsForStart = LIMIT - runningTransactionsClient2.length;
    //     for (let i = 0; i < availableLimitTransactionsForStart; i++) {
    //         const transaction = waitingStartTransactionsClient2[i];
    //         if (transaction?.action === 'generateImageByText' || transaction?.action === 'stylingImageByText') {
    //             const { prompt, _id, waitMessageId, chatId, midjourneyClientId } = transaction;
    //             newImagine({ prompt, _id, waitMessageId: +waitMessageId, chatId, midjourneyClientId });
    //         } else if (transaction?.action === 'failed' || transaction?.action === 'badRequest') {
    //             //хз пока, наверное запустить по новой
    //         } else if (transaction?.action && transaction.action.includes('!!!')) {
    //             if (
    //                 transaction.action.includes('U1') ||
    //                 transaction.action.includes('U2') ||
    //                 transaction.action.includes('U3') ||
    //                 transaction.action.includes('U4')
    //             ) {
    //                 newUpscale(transaction);
    //             } else if (
    //                 transaction.action.includes('V1') ||
    //                 transaction.action.includes('V2') ||
    //                 transaction.action.includes('V3') ||
    //                 transaction.action.includes('V4')
    //             ) {
    //                 newVariation(transaction);
    //             } else {
    //                 newReroll(transaction);
    //             }
    //         }
    //     }
    //
    //     for (let i = availableLimitTransactionsForStart; i < waitingStartTransactions.length; i++) {
    //         const { chatId, waitMessageId } = waitingStartTransactionsClient2[i] || {};
    //         TelegramBot.telegram
    //             .editMessageCaption(chatId, +waitMessageId, '0', waitMessageWithQuines(i.toString()))
    //             .catch(() => _.noop);
    //     }
    // }

    //если есть ожидающие запуска и запущено меньше 3, то запускаем ещё
    if (waitingStartTransactionsClient3.length && runningTransactionsClient3.length < LIMIT) {
        const availableLimitTransactionsForStart = LIMIT - runningTransactionsClient3.length;
        for (let i = 0; i < availableLimitTransactionsForStart; i++) {
            const transaction = waitingStartTransactionsClient3[i];
            if (transaction?.action === 'generateImageByText' || transaction?.action === 'stylingImageByText') {
                const { prompt, _id, waitMessageId, chatId, midjourneyClientId } = transaction;
                newImagine({ prompt, _id, waitMessageId: +waitMessageId, chatId, midjourneyClientId });
            } else if (transaction?.action === 'failed' || transaction?.action === 'badRequest') {
                //хз пока, наверное запустить по новой
            } else if (transaction?.action && transaction.action.includes('!!!')) {
                if (
                    transaction.action.includes('U1') ||
                    transaction.action.includes('U2') ||
                    transaction.action.includes('U3') ||
                    transaction.action.includes('U4')
                ) {
                    newUpscale(transaction);
                } else if (
                    transaction.action.includes('V1') ||
                    transaction.action.includes('V2') ||
                    transaction.action.includes('V3') ||
                    transaction.action.includes('V4')
                ) {
                    newVariation(transaction);
                } else {
                    newReroll(transaction);
                }
            }
        }

        for (let i = availableLimitTransactionsForStart; i < waitingStartTransactions.length; i++) {
            const { chatId, waitMessageId } = waitingStartTransactionsClient3[i] || {};
            TelegramBot.telegram
                .editMessageCaption(chatId, +waitMessageId, '0', waitMessageWithQuines(i.toString()))
                .catch(() => _.noop);
        }
    }
});
