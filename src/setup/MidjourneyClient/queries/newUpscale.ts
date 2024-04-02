import { MJMessage } from 'midjourney';
import * as dotenv from 'dotenv';
import TelegramBot from '../../TelegramBot/init';
import MidjourneyClient from '../index';
import { getQuery } from '../../../api/query';
import { sendSomethingWentWrong } from '../../../utils/sendLoading';
import { updateTransaction } from '../../../utils/db/saveTransactionsInDB';
import { messageResult, ReplayToGroup } from '../../../constants/messages';

dotenv.config();

export const newUpscale = async ({ chatId, waitMessageId, _id, action }: ApiTypes.Transaction) => {
    try {
        const queryId = action?.split('!!!')[0] || '';
        const button = action?.split('!!!')[1] || '';
        const { buttons, discordMsgId, prompt, originPrompt, flags } = await getQuery({ _id: queryId });
        const allCustomButtons = JSON.parse(buttons) as Record<string, string>;
        const custom = allCustomButtons[button];

        MidjourneyClient.Custom({
            msgId: discordMsgId,
            flags: Number(flags),
            customId: custom,
        })
            .then(async (Upscale: MJMessage | null) => {
                if (!Upscale) throw new Error('no Upscale');

                TelegramBot.telegram.editMessageCaption(chatId, +waitMessageId, '0', `Download photo...`);
                TelegramBot.telegram
                    .sendPhoto(
                        chatId,
                        { url: Upscale.uri },
                        {
                            parse_mode: 'Markdown',
                            caption: messageResult(originPrompt),
                        },
                    )
                    .then(resultMessage => {
                        const groupChatId = process.env.GROUP_ID as string;
                        if (ReplayToGroup()) {
                            TelegramBot.telegram.forwardMessage(groupChatId, chatId, resultMessage.message_id);
                        }
                    })
                    .catch(e => {
                        console.log('не удалось отправить результирующее фото', e);
                        throw new Error(e);
                    })
                    .finally(() => {
                        TelegramBot.telegram.deleteMessage(chatId, +waitMessageId);
                    });

                updateTransaction({
                    _id,
                    prompt,
                    originPrompt,
                    buttons: '',
                    discordMsgId: Upscale.id || '',
                    flags: Upscale.flags.toString(),
                    stage: 'completed',
                });
            })
            .catch(e => {
                //скорее всего где то тут ошибка появляется, что в дискорде очередь забита
                console.log('NewUpscale -> MidjourneyClient.Custom -> catch', e);
                updateTransaction({
                    _id,
                    buttons: '',
                    discordMsgId: '',
                    flags: '',
                    stage: 'badRequest',
                });

                TelegramBot.telegram.deleteMessage(chatId, +waitMessageId);
                sendSomethingWentWrong(chatId);
            });
    } catch (e) {
        console.error('newUpscale -> catch', e);
        updateTransaction({
            _id,
            stage: 'failed',
        });
    }
};
