import { MJMessage } from 'midjourney';
import { Markup } from 'telegraf';
import TelegramBot from '../../TelegramBot/init';
import MidjourneyClient from '../index';
import {
    sendBadRequestMessage,
    sendDownloadPhotoInProgressMesage,
    sendLoadingMesage,
    sendSomethingWentWrong,
} from '../../../utils/sendLoading';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../../../utils/getButtonsForFourPhoto';
import { updateTransaction } from '../../../utils/db/saveTransactionsInDB';
import { getQuery } from '../../../api/query';

export const newReroll = async ({ chatId, waitMessageId, _id, action }: ApiTypes.Transaction) => {
    try {
        const queryId = action?.split('!!!')[0] || '';
        const { prompt, originPrompt } = await getQuery({ _id: queryId });

        MidjourneyClient.Imagine(prompt, (_, progress: string) => sendLoadingMesage(chatId, +waitMessageId, progress))
            .then((Imagine: MJMessage | null) => {
                if (!Imagine) return sendSomethingWentWrong(chatId);
                if (Imagine.uri) {
                    sendDownloadPhotoInProgressMesage(chatId, +waitMessageId);

                    TelegramBot.telegram
                        .sendPhoto(
                            chatId,
                            { url: Imagine.uri },
                            {
                                reply_markup: Markup.inlineKeyboard(getButtonsForFourPhoto(_id)).reply_markup,
                                parse_mode: 'Markdown',
                            },
                        )
                        .finally(() => {
                            TelegramBot.telegram.deleteMessage(chatId, +waitMessageId);
                        });

                    //снимаем со счёта пользователя запрос
                    // writeOffRequestFromUser(chatId);

                    //обновляем данные о выполненном запросе в базе
                    updateTransaction({
                        _id,
                        prompt,
                        originPrompt,
                        buttons: JSON.stringify(getDataButtonsForFourPhoto(Imagine)),
                        discordMsgId: Imagine.id || '',
                        flags: Imagine.flags.toString(),
                        stage: 'completed',
                    });
                } else {
                    console.log('Я хз что тут будет, надо разобраться', Imagine);
                    throw new Error('Я хз что тут будет а ошибка, надо разобраться');
                }
            })
            .catch(e => {
                //скорее всего где то тут ошибка появляется, что в дискорде очередь забита
                console.error('generateByText -> MidjourneyClient.Imagine -> catch ', e);
                updateTransaction({
                    _id,
                    prompt,
                    originPrompt,
                    stage: 'badRequest',
                });
                TelegramBot.telegram.deleteMessage(chatId, +waitMessageId);
                return sendBadRequestMessage(chatId);
            });
    } catch (e) {
        console.error('newReroll -> catch', e);
        updateTransaction({
            _id,
            stage: 'failed',
        });
    }
};
