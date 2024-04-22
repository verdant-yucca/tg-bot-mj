import { MJMessage } from 'midjourney';
import * as dotenv from 'dotenv';
import TelegramBot from '../../TelegramBot/init';
import { MidjourneyClient } from '../index';
import { getQuery } from '../../../api/query';
import { sendBadRequestMessage, sendSomethingWentWrong } from '../../../utils/sendLoading';
import { updateTransaction } from '../../../utils/db/saveTransactionsInDB';
import { messageResult, ReplayToGroup } from '../../../constants/messages';

dotenv.config();

export const newUpscale = async ({ chatId, waitMessageId, _id, action }: ApiTypes.Transaction) => {
    try {
        //обновляем данные о начале выполнения запроса в базе
        await updateTransaction({
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
            await updateTransaction({
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
                customId: custom
            })
            .then(async (Upscale: MJMessage | null) => {
                if (!Upscale) {
                    console.error('нет Upscale в newUpscale -> 39 line');
                    return;
                }

                TelegramBot.telegram
                    .editMessageText(chatId, +waitMessageId, '0', `Download photo...`)
                    .catch(e => console.error('е удалось удалить ожидающее сообщение', e));
                TelegramBot.telegram
                    .sendPhoto(
                        chatId,
                        { url: Upscale.uri },
                        {
                            parse_mode: 'Markdown',
                            caption: messageResult(originPrompt)
                        }
                    )
                    .then(resultMessage => {
                        const groupChatId = process.env.GROUP_ID as string;
                        if (ReplayToGroup()) {
                            TelegramBot.telegram
                                .forwardMessage(groupChatId, chatId, resultMessage.message_id)
                                .catch(e => console.error('не удалось переслать сообщение в группу', e));
                        }
                    })
                    .catch(e => {
                        console.error('не удалось отправить результирующее фото', e);
                    })
                    .finally(() => {
                        TelegramBot.telegram
                            .deleteMessage(chatId, +waitMessageId)
                            .catch(e => console.error('не удалось удалить ожидающее сообщение', e));
                    });

                updateTransaction({
                    _id,
                    prompt,
                    originPrompt,
                    buttons: '',
                    discordMsgId: Upscale.id || '',
                    flags: Upscale.flags.toString(),
                    stage: 'completed'
                }).catch(e => console.error('не удалось обновить транзакцию', e));
            })
            .catch(e => {
                //скорее всего где то тут ошибка появляется, что в дискорде очередь забита
                console.log('NewUpscale -> MidjourneyClient.Custom -> catch', e);
                if (
                    e.message ===
                    'Your job queue is full. Please wait for a job to finish first, then resubmit this one.' ||
                    e.message === 'ImagineApi failed with status 429'
                ) {
                    console.log('e.message', e.message);
                    updateTransaction({
                        _id,
                        prompt,
                        originPrompt,
                        stage: 'waiting start'
                    }).catch(e => console.error('не удалось обновить транзакцию', e));
                } else if (e.message.includes('Banned prompt detected')) {
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
        console.error('newUpscale -> catch', e);
        updateTransaction({
            _id,
            stage: 'failed'
        }).catch(e => console.error('не удалось обновить транзакцию', e));
    }
};
