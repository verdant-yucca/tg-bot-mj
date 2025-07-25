import cron from 'node-cron';
import { deleteTransaction, getTransactions, updateTransaction } from '../../utils/db/saveTransactionsInDB';
import { newImagine } from '../MidjourneyClient/queries/newImagine';
import { newReroll } from '../MidjourneyClient/queries/newReroll';
import { newUpscale } from '../MidjourneyClient/queries/newUpscale';
import { newVariation } from '../MidjourneyClient/queries/newVariation';
import { saveQueryInDB } from '../../utils/db/saveQueryInDB';
import TelegramBot from '../TelegramBot/init';
import { countFreeRequest, waitMessageWithQuines } from '../../constants/messages';
import _ from 'lodash';
import { updateCountFreeQueriesForAllUsers } from '../../api/users';
import { MidjourneyClient } from '../MidjourneyClient';

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
    //#region обработка выполненных и плохих запросов
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
    //#endRegion

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
    const allClients = Object.keys(MidjourneyClient);
    allClients.forEach((key) => {
        const runningTransactions = transactions.filter(({ stage }) => stage === 'running');
        const runningTransactionsClient = runningTransactions.filter(
            ({ midjourneyClientId }) => midjourneyClientId === key
        );
        const waitingStartTransactionsClient = waitingStartTransactions.filter(
            ({ midjourneyClientId }) => midjourneyClientId === key
        );

        //если что то зависло больше чем на 20 мин, то перезапускаем
        runningTransactionsClient.forEach(({ _id, dateUpdate }) => {
            const dateRunning = new Date(dateUpdate);
            const dateNow = new Date();
            const leadTime = dateNow.getTime() - dateRunning.getTime();
            if (leadTime > 1000 * 60 * 20) {
                updateTransaction({
                    _id,
                    stage: 'waiting start'
                }).catch(e => console.error('не удалось обновить транзакцию', e));
            }
        });

        //если есть ожидающие запуска и запущено меньше 3, то запускаем ещё
        if (waitingStartTransactionsClient.length && runningTransactionsClient.length < LIMIT) {
            const availableLimitTransactionsForStart = LIMIT - runningTransactionsClient.length;
            for (let i = 0; i < availableLimitTransactionsForStart; i++) {
                const transaction = waitingStartTransactionsClient[i];
                if (transaction?.action === 'generateImageByText' || transaction?.action === 'stylingImageByText') {
                    const { prompt, _id, waitMessageId, chatId, midjourneyClientId } = transaction;
                    newImagine({ prompt, _id, waitMessageId: +waitMessageId, chatId, midjourneyClientId });
                } else if (transaction?.action === 'failed' || transaction?.action === 'badRequest') {
                    //хз пока, наверное запустить по новой
                } else if (transaction?.action && transaction.action.includes('!!!')) {
                    if (
                        transaction.action.includes('!!!U1') ||
                        transaction.action.includes('!!!U2') ||
                        transaction.action.includes('!!!U3') ||
                        transaction.action.includes('!!!U4')
                    ) {
                        newUpscale(transaction);
                    } else if (
                        transaction.action.includes('!!!V1') ||
                        transaction.action.includes('!!!V2') ||
                        transaction.action.includes('!!!V3') ||
                        transaction.action.includes('!!!V4')
                    ) {
                        newVariation(transaction);
                    } else {
                        newReroll(transaction);
                    }
                }
            }

            for (let i = availableLimitTransactionsForStart; i < waitingStartTransactions.length; i++) {
                const { chatId, waitMessageId } = waitingStartTransactionsClient[i] || {};
                TelegramBot.telegram
                    .editMessageText(chatId, +waitMessageId, '0', waitMessageWithQuines(i.toString()))
                    .catch(() => _.noop);
            }
        }
    });
});
