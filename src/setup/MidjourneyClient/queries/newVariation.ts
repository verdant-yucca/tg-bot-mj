import MidjourneyClient from '../index';
import {
    sendDownloadPhotoInProgressMesage,
    sendLoadingMesage,
    sendSomethingWentWrong,
} from '../../../utils/sendLoading';
import { MJMessage } from 'midjourney';
import TelegramBot from '../../TelegramBot/init';
import { updateTransaction } from '../../../utils/db/saveTransactionsInDB';
import * as dotenv from 'dotenv';
import { getQuery } from '../../../api/query';
import { Markup } from 'telegraf';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../../../utils/getButtonsForFourPhoto';

dotenv.config();

export const newVariation = async ({ chatId, waitMessageId, _id, action }: ApiTypes.Transaction) => {
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
            content: prompt, //remix mode require content
            loading: (_, progress: string) => sendLoadingMesage(chatId, +waitMessageId, progress),
        })
            .then(async (Variation: MJMessage | null) => {
                if (!Variation) throw new Error('no Variation');
                sendDownloadPhotoInProgressMesage(chatId, +waitMessageId);

                TelegramBot.telegram
                    .sendPhoto(chatId, { url: Variation.uri }, Markup.inlineKeyboard(getButtonsForFourPhoto(_id)))
                    .catch(e => {
                        console.log('не удалось отправить результат', e);
                        return sendSomethingWentWrong(chatId);
                    })
                    .finally(() => {
                        TelegramBot.telegram.deleteMessage(chatId, +waitMessageId);
                    });

                updateTransaction({
                    _id,
                    prompt,
                    originPrompt,
                    buttons: JSON.stringify(getDataButtonsForFourPhoto(Variation)),
                    discordMsgId: Variation.id || '',
                    flags: Variation.flags.toString(),
                    stage: 'completed',
                });
            })
            .catch(e => {
                //скорее всего где то тут ошибка появляется, что в дискорде очередь забита
                console.log('NewUpscale -> MidjourneyClient.Custom -> catch', e);
                updateTransaction({
                    _id,
                    prompt,
                    originPrompt,
                    buttons: '',
                    discordMsgId: '',
                    flags: '',
                    stage: 'badRequest',
                });

                TelegramBot.telegram.deleteMessage(chatId, +waitMessageId);
                sendSomethingWentWrong(chatId);
            });
    } catch (e) {
        console.error('newVariation -> catch', e);
        updateTransaction({
            _id,
            stage: 'failed',
        });
    }
};
