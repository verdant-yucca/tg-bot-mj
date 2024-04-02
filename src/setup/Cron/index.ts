import cron from 'node-cron';
import { deleteTransaction, getTransactions } from '../../utils/db/saveTransactionsInDB';
import { newImagine } from '../MidjourneyClient/queries/newImagine';
import { newReroll } from '../MidjourneyClient/queries/newReroll';
import { newUpscale } from '../MidjourneyClient/queries/newUpscale';
import { newVariation } from '../MidjourneyClient/queries/newVariation';
import { saveQueryInDB } from '../../utils/db/saveQueryInDB';

const LIMIT = 5;

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
    const completedTransactions = transactions.filter(({ stage }) => stage === 'completed');
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
    //если есть ожидающие запуска и запущено меньше 5, то запускаем ещё
    if (waitingStartTransactions.length && runningTransactions.length < LIMIT) {
        const availableLimitTransactionsForStart = LIMIT - runningTransactions.length;
        for (let i = 0; i < availableLimitTransactionsForStart; i++) {
            const transaction = waitingStartTransactions[i];
            console.log(transaction);
            if (transaction?.action === 'generateImageByText' || transaction?.action === 'stylingImageByText') {
                const { prompt, _id, waitMessageId, chatId } = transaction;
                newImagine({ prompt, _id, waitMessageId: +waitMessageId, chatId });
            } else if (transaction?.action === 'failed' || transaction?.action === 'badRequest') {
                //хз пока, наверное запустить по новой
            } else if (transaction?.action && transaction?.action.includes('!!!')) {
                const button = transaction?.action?.split('!!!')[1] || '';
                const allCustomButtons = JSON.parse(transaction.buttons) as Record<string, string>;
                const custom = allCustomButtons[button];
                if (custom.includes('upsample')) {
                    newUpscale(transaction);
                } else if (custom.includes('variation')) {
                    newVariation(transaction);
                } else if (custom.includes('reroll')) {
                    newReroll(transaction);
                }
            }
        }
    }
});
