import { MidjourneyClient } from '../index';
import {
    sendBadRequestMessage,
    sendDownloadPhotoInProgressMesage,
    sendLoadingMesage,
    sendSomethingWentWrong
} from '../../../utils/sendLoading';
import { MJMessage } from 'midjourney';
import TelegramBot from '../../TelegramBot/init';
import { updateTransaction } from '../../../utils/db/saveTransactionsInDB';
import * as dotenv from 'dotenv';
import { getQuery } from '../../../api/query';
import { Markup } from 'telegraf';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../../../utils/getButtonsForFourPhoto';
import _ from 'lodash';
import { compressImage } from '../../../utils/compressImage';

dotenv.config();

export const newVariation = async ({ chatId, waitMessageId, _id, action }: ApiTypes.Transaction) => {
    try {
        //обновляем данные о начале выполнения запроса в базе
        updateTransaction({
            _id,
            stage: 'running'
        });
        const queryId = action?.split('!!!')[0] || '';
        const button = action?.split('!!!')[1] || '';
        const {
            buttons,
            discordMsgId,
            prompt,
            originPrompt,
            flags,
            midjourneyClientId = '1'
        } = await getQuery({ queryId });
        if (!buttons) {
            updateTransaction({
                _id,
                stage: 'waiting start'
            });
        }
        const allCustomButtons = JSON.parse(buttons) as Record<string, string>;
        const custom = allCustomButtons[button];

        MidjourneyClient[midjourneyClientId]
            .Custom({
                msgId: discordMsgId,
                flags: Number(flags),
                customId: custom,
                content: prompt, //remix mode require content
                loading: (_, progress: string) => sendLoadingMesage(chatId, +waitMessageId, progress)
            })
            .then(async (Variation: MJMessage | null) => {
                if (!Variation) {
                    console.error('нет Variation в newUpscale -> 34 line');
                    return;
                }
                sendDownloadPhotoInProgressMesage(chatId, +waitMessageId);

                compressImage(Variation.uri).then(result => {
                    if (result === 1) {
                        TelegramBot.telegram
                            .sendPhoto(chatId, { url: Variation.uri }, Markup.inlineKeyboard(getButtonsForFourPhoto(_id)))
                            .catch(e => {
                                console.log('не удалось отправить результат', e);
                                sendSomethingWentWrong(chatId);
                            })
                            .finally(() => {
                                TelegramBot.telegram
                                    .deleteMessage(chatId, +waitMessageId)
                                    .catch(e => console.error('е удалось удалить ожидающее сообщение', e));
                            });
                    } else {
                        TelegramBot.telegram
                            .sendPhoto(chatId, { source: result }, Markup.inlineKeyboard(getButtonsForFourPhoto(_id)))
                            .catch(e => {
                                console.log('не удалось отправить результат', e);
                                sendSomethingWentWrong(chatId);
                            })
                            .finally(() => {
                                TelegramBot.telegram
                                    .deleteMessage(chatId, +waitMessageId)
                                    .catch(e => console.error('е удалось удалить ожидающее сообщение', e));
                            });
                    }
                }).then(() => {
                    updateTransaction({
                        _id,
                        prompt,
                        originPrompt,
                        buttons: JSON.stringify(getDataButtonsForFourPhoto(Variation)),
                        discordMsgId: Variation.id || '',
                        flags: Variation.flags.toString(),
                        stage: 'completed'
                    }).catch(e => console.error('не удалось обновить транзакцию', e));
                }).catch((e) => {
                    TelegramBot.telegram.sendMessage(1343412914, `123 Вариации. ${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);

                });
            })
            .catch(e => {
                //скорее всего где то тут ошибка появляется, что в дискорде очередь забита
                console.log('NewUpscale -> MidjourneyClient.Custom -> catch', e);
                if (
                    e.message ===
                    'Your job queue is full. Please wait for a job to finish first, then resubmit this one.' ||
                    e.message === 'ImagineApi failed with status 429'
                ) {
                    TelegramBot.telegram.sendMessage(1343412914, `Вариации. ${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    console.log('e.message', e.message);
                    updateTransaction({
                        _id,
                        prompt,
                        originPrompt,
                        stage: 'waiting start'
                    }).catch(e => console.error('не удалось обновить транзакцию', e));
                } else if (e.message.includes('Banned prompt detected')) {
                    TelegramBot.telegram.sendMessage(1343412914, `Вариации. ${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    TelegramBot.telegram
                        .deleteMessage(chatId, +waitMessageId)
                        .catch(e => console.error('удаление сообщения неуспешно', e));
                    sendBadRequestMessage(chatId);
                    updateTransaction({
                        _id,
                        prompt,
                        originPrompt,
                        stage: 'badRequest'
                    }).catch(e => console.error('не удалось обновить транзакцию', e));
                } else {
                    TelegramBot.telegram.sendMessage(1343412914, `Вариации. ${e.message}. chatId = ${chatId}. waitMessageId = ${waitMessageId}`).catch(() => _.noop);
                    console.log('e.message undetected', e.message);
                    updateTransaction({
                        _id,
                        prompt,
                        originPrompt,
                        stage: 'waiting start'
                    }).catch(e => console.error('не удалось обновить транзакцию', e));
                }
            });
    } catch (e) {
        console.error('newVariation -> catch', e);
        updateTransaction({
            _id,
            stage: 'failed'
        }).catch(e => console.error('не удалось обновить транзакцию', e));
    }
};
