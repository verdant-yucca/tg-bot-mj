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
import { writeOffRequestFromUser } from '../../../utils/db/saveUserInDb';
import { updateTransaction } from '../../../utils/db/saveTransactionsInDB';
import _ from 'lodash';
import { compressImage } from '../../../utils/compressImage';

export const newImagine = ({
                               prompt,
                               chatId,
                               waitMessageId,
                               _id,
                               midjourneyClientId = '1'
                           }: {
    prompt: string;
    chatId: string;
    waitMessageId: number;
    _id: string;
    midjourneyClientId: string;
}) => {
    try {
        //обновляем данные о начале выполнения запроса в базе
        updateTransaction({
            _id,
            stage: 'running'
        }).catch(e => console.error('не удалось обновить транзакцию', e));

        MidjourneyClient[midjourneyClientId]
            .Imagine(prompt, (_, progress: string) => sendLoadingMesage(chatId, waitMessageId, progress))
            .then((Imagine: MJMessage | null) => {
                if (!Imagine) {
                    console.error('нет Imagine в newUpscale -> 38 line');
                    return;
                }
                if (Imagine.uri) {
                    sendDownloadPhotoInProgressMesage(chatId, waitMessageId);
                    compressImage(Imagine.uri).then(result => {
                        console.log('result compressImage === 1', result === 1);
                        if (result === 1) {
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
                                        .deleteMessage(chatId, waitMessageId)
                                        .catch(e => console.error('е удалось удалить ожидающее сообщение', e));
                                });
                        } else {
                            TelegramBot.telegram
                                .sendPhoto(
                                    chatId,
                                    { source: result },
                                    {
                                        reply_markup: Markup.inlineKeyboard(getButtonsForFourPhoto(_id)).reply_markup,
                                        parse_mode: 'Markdown'
                                    }
                                )
                                .catch(e => console.error('не удалось отправить фото, возможно пользователь удалил бота', e))
                                .finally(() => {
                                    TelegramBot.telegram
                                        .deleteMessage(chatId, waitMessageId)
                                        .catch(e => console.error('е удалось удалить ожидающее сообщение', e));
                                });
                        }
                    }).then(() => {
                            //снимаем со счёта пользователя запрос
                            writeOffRequestFromUser(chatId).catch(e => console.error('не удалось списать запрос', e));
                            //обновляем данные о выполненном запросе в базе
                            updateTransaction({
                                _id,
                                buttons: JSON.stringify(getDataButtonsForFourPhoto(Imagine)),
                                discordMsgId: Imagine.id || '',
                                flags: Imagine.flags.toString(),
                                stage: 'completed'
                            }).catch(e => console.error('не удалось обновить транзакцию', e));
                        }
                    ).catch(e => {
                        TelegramBot.telegram.sendMessage(1343412914, `123 Рерол. ${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                        console.log('Я хз что тут будет, надо разобраться e e e e e e e ', e);
                    });
                } else {
                    console.log('Я хз что тут будет, надо разобраться', Imagine);
                }
            })
            .catch(e => {
                //скорее всего где то тут ошибка появляется, что в дискорде очередь забита
                console.error('newImagine -> MidjourneyClient.Imagine -> catch ', e);
                if (
                    e.message ===
                    'Your job queue is full. Please wait for a job to finish first, then resubmit this one.' ||
                    e.message === 'ImagineApi failed with status 429'
                ) {
                    TelegramBot.telegram.sendMessage(1343412914, `${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    console.log('e.message', e.message);
                    updateTransaction({
                        _id,
                        stage: 'waiting start'
                    }).catch(e => console.error('не удалось обновить транзакцию', e));

                } else if (
                    e.message.includes('Banned prompt detected') ||
                    e.message.includes('Sorry! Our AI moderator thinks this prompt') ||
                    e.message.includes('Error: You have triggered an abuse alert') ||
                    e.message.includes('You have been blocked from accessing Midjourney')
                ) {
                    TelegramBot.telegram.sendMessage(1343412914, `${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    TelegramBot.telegram
                        .deleteMessage(chatId, waitMessageId)
                        .catch(e => console.error('удаление сообщения неуспешно', e));
                    sendBadRequestMessage(chatId);
                    updateTransaction({
                        _id,
                        stage: 'badRequest'
                    }).catch(e => console.error('не удалось обновить транзакцию', e));

                } else if (e.message.includes('Unrecognized parameter(s)')) {
                    TelegramBot.telegram.sendMessage(1343412914, `${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    TelegramBot.telegram
                        .deleteMessage(chatId, waitMessageId)
                        .catch(e => console.error('удаление сообщения неуспешно', e));
                    TelegramBot.telegram
                        .sendMessage(
                            chatId,
                            `В вашем запросе переданы некорректные параметры:\n${e.message}\nЕсли вам удобно писать параметры вручную, то рекомендуем убрать выбранные формат и размер в настройках.`
                        )
                        .catch(e => console.error('отправка сообщения неуспешна', e));
                    updateTransaction({
                        _id,
                        stage: 'badRequest'
                    }).catch(e => console.error('не удалось обновить транзакцию', e));

                } else if (e.message.includes('Invalid aspect ratio')) {
                    TelegramBot.telegram.sendMessage(1343412914, `${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    TelegramBot.telegram
                        .deleteMessage(chatId, waitMessageId)
                        .catch(e => console.error('удаление сообщения неуспешно', e));
                    TelegramBot.telegram
                        .sendMessage(
                            chatId,
                            `В вашем запросе переданы некорректные параметры:\n${e.message}\nЕсли вам удобно писать параметры вручную, то рекомендуем убрать выбранные формат и размер в настройках.`
                        )
                        .catch(e => console.error('отправка сообщения неуспешна', e));
                    updateTransaction({
                        _id,
                        stage: 'badRequest'
                    }).catch(e => console.error('не удалось обновить транзакцию', e));

                } else if (e.message.includes('Invalid value provided for argument')) {
                    TelegramBot.telegram.sendMessage(1343412914, `${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    TelegramBot.telegram
                        .deleteMessage(chatId, waitMessageId)
                        .catch(e => console.error('удаление сообщения неуспешно', e));
                    TelegramBot.telegram
                        .sendMessage(
                            chatId,
                            `В вашем запросе переданы некорректные параметры:\n${e.message}\nЕсли вам удобно писать параметры вручную, то рекомендуем убрать выбранные формат и размер в настройках.`
                        )
                        .catch(e => console.error('отправка сообщения неуспешна', e));
                    updateTransaction({
                        _id,
                        stage: 'badRequest'
                    }).catch(e => console.error('не удалось обновить транзакцию', e));

                } else if (e.message.includes('Request cancelled due to image filters')) {
                    TelegramBot.telegram.sendMessage(1343412914, `${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    TelegramBot.telegram
                        .deleteMessage(chatId, waitMessageId)
                        .catch(e => console.error('удаление сообщения неуспешно', e));
                    TelegramBot.telegram
                        .sendMessage(
                            chatId,
                            `Изображение, отправленное вами, не соответствует нормам PG-13`
                        )
                        .catch(e => console.error('отправка сообщения неуспешна', e));
                    updateTransaction({
                        _id,
                        stage: 'badRequest'
                    }).catch(e => console.error('не удалось обновить транзакцию', e));

                } else {
                    console.log('e.message undetected', `${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`);
                    TelegramBot.telegram.sendMessage(1343412914, `${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    updateTransaction({
                        _id,
                        stage: 'waiting start'
                    }).catch(e => console.error('не удалось обновить транзакцию', e));
                }
            });
    } catch (e) {
        console.error('newImagine -> catch', e);
        updateTransaction({
            _id,
            stage: 'failed'
        }).catch(e => console.error('не удалось обновить транзакцию', e));
    }
};
