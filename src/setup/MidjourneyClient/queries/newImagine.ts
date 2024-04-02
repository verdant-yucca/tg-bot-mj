import { MJMessage } from 'midjourney';
import { Markup } from 'telegraf';
import TelegramBot from '../../TelegramBot/init';
import MidjourneyClient from '../index';
import {
    sendBadRequestMessage,
    sendDownloadPhotoInProgressMesage,
    sendLoadingMesage,
} from '../../../utils/sendLoading';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../../../utils/getButtonsForFourPhoto';
import { writeOffRequestFromUser } from '../../../utils/db/saveUserInDb';
import { updateTransaction } from '../../../utils/db/saveTransactionsInDB';

export const newImagine = ({
    prompt,
    chatId,
    waitMessageId,
    _id,
}: {
    prompt: string;
    chatId: string;
    waitMessageId: number;
    _id: string;
}) => {
    try {
        MidjourneyClient.Imagine(prompt, (_, progress: string) => sendLoadingMesage(chatId, waitMessageId, progress))
            .then((Imagine: MJMessage | null) => {
                console.log('Imagine', Imagine);
                if (!Imagine) throw new Error('no Imagine at 29 line code');
                if (Imagine.uri) {
                    sendDownloadPhotoInProgressMesage(chatId, waitMessageId);

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
                            TelegramBot.telegram.deleteMessage(chatId, waitMessageId);
                        });

                    //снимаем со счёта пользователя запрос
                    writeOffRequestFromUser(chatId);
                    //обновляем данные о выполненном запросе в базе
                    updateTransaction({
                        _id,
                        buttons: JSON.stringify(getDataButtonsForFourPhoto(Imagine)),
                        discordMsgId: Imagine.id || '',
                        flags: Imagine.flags.toString(),
                        stage: 'completed',
                    });
                } else {
                    console.log('Я хз что тут будет, надо разобраться', Imagine);
                    throw new Error('Я хз что тут будет, надо разобраться');
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
                    console.log('e.message', e.message);
                    updateTransaction({
                        _id,
                        buttons: '',
                        discordMsgId: '',
                        flags: '',
                        stage: 'waiting start',
                    });
                } else if (e.message.includes('Banned prompt detected')) {
                    TelegramBot.telegram.deleteMessage(chatId, waitMessageId);
                    sendBadRequestMessage(chatId);
                    updateTransaction({
                        _id,
                        stage: 'badRequest',
                    });
                } else {
                    console.log('e.message undetected', e.message);
                    updateTransaction({
                        _id,
                        buttons: '',
                        discordMsgId: '',
                        flags: '',
                        stage: 'waiting start',
                    });
                }
            });
    } catch (e) {
        console.error('newImagine -> catch', e);
        updateTransaction({
            _id,
            buttons: '',
            discordMsgId: '',
            flags: '',
            stage: 'failed',
        });
    }
};
