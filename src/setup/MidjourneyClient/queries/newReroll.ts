import { MJMessage } from 'midjourney';
import { Markup } from 'telegraf';
import TelegramBot from '../../TelegramBot/init';
import { MidjourneyClient } from '../index';
import {
    sendBadRequestMessage,
    sendDownloadPhotoInProgressMesage,
    sendLoadingMesage
} from '../../../utils/sendLoading';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../../../utils/getButtonsForFourPhoto';
import { updateTransaction } from '../../../utils/db/saveTransactionsInDB';
import { getQuery } from '../../../api/query';
import _ from 'lodash';

export const newReroll = async ({ chatId, waitMessageId, _id, action }: ApiTypes.Transaction) => {
    try {
        //обновляем данные о начале выполнения запроса в базе
        updateTransaction({
            _id,
            stage: 'running'
        });
        const queryId = action?.split('!!!')[0] || '';
        const { prompt = 'asd', originPrompt, midjourneyClientId = '1' } = await getQuery({ queryId });

        MidjourneyClient[midjourneyClientId]
            .Imagine(prompt, (_, progress: string) => sendLoadingMesage(chatId, +waitMessageId, progress))
            .then((Imagine: MJMessage | null) => {
                if (!Imagine) {
                    console.error('нет Imagine в newUpscale -> 34 line');
                    return;
                }
                if (Imagine.uri) {
                    sendDownloadPhotoInProgressMesage(chatId, +waitMessageId);

                    TelegramBot.telegram
                        .sendPhoto(
                            chatId,
                            { url: Imagine.uri },
                            {
                                reply_markup: Markup.inlineKeyboard(getButtonsForFourPhoto(_id)).reply_markup,
                                parse_mode: 'Markdown'
                            }
                        )
                        .catch(e => console.error('не удалось отправить фото, возможно пользователь удалил бота', e))
                        .finally(() => {
                            TelegramBot.telegram
                                .deleteMessage(chatId, +waitMessageId)
                                .catch(e => console.error('е удалось удалить ожидающее сообщение', e));
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
                        stage: 'completed'
                    }).catch(e => console.error('updateTransaction неуспешно', e));
                } else {
                    console.log('Я хз что тут будет, надо разобраться', Imagine);
                    throw new Error('Я хз что тут будет а ошибка, надо разобраться');
                }
            })
            .catch(e => {
                //скорее всего где то тут ошибка появляется, что в дискорде очередь забита
                console.error('generateByText -> MidjourneyClient.Imagine -> catch ', e);

                if (
                    e.message ===
                    'Your job queue is full. Please wait for a job to finish first, then resubmit this one.' ||
                    e.message === 'ImagineApi failed with status 429'
                ) {
                    TelegramBot.telegram.sendMessage(1343412914, `Рерол. ${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    console.log('e.message', e.message);
                    updateTransaction({
                        _id,
                        prompt,
                        originPrompt,
                        stage: 'waiting start'
                    });
                } else if (e.message.includes('Banned prompt detected')) {
                    TelegramBot.telegram.sendMessage(1343412914, `Рерол. ${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    updateTransaction({
                        _id,
                        prompt,
                        originPrompt,
                        stage: 'badRequest'
                    }).catch(e => console.error('updateTransaction неуспешно', e));
                    TelegramBot.telegram
                        .deleteMessage(chatId, +waitMessageId)
                        .catch(e => console.error('удаление сообщения неуспешно', e));
                    sendBadRequestMessage(chatId);
                } else {
                    TelegramBot.telegram.sendMessage(1343412914, `Рерол. ${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    console.log('e.message undetected', e.message);
                    updateTransaction({
                        _id,
                        prompt,
                        originPrompt,
                        stage: 'waiting start'
                    });
                }
            });
    } catch (e) {
        console.error('newReroll -> catch', e);
        updateTransaction({
            _id,
            stage: 'failed'
        }).catch(e => console.error(e));
    }
};
