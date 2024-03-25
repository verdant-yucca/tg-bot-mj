import { Markup, Scenes } from 'telegraf';
import { MJMessage } from 'midjourney';
import { client } from '../setup/bot';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../utils/getButtonsForFourPhoto';
import {
    sendDownloadPhotoInProgressMesage, sendHasCompletedRequestMessage, sendHasOutstandingRequestMessage,
    sendLoadingMesage,
    sendSomethingWentWrong,
    sendWaitMessage
} from '../utils/sendLoading';
import { saveQueryInDB, updateQueryInDB } from '../utils';
import { getQuery } from '../api/query';
import * as dotenv from 'dotenv';
import { checkIsGroupMember } from '../utils/checkIsGroupMember';
import { findQueryInDB } from '../utils/saveQueryInDB';
import {messageResult, ReplayToGroup} from '../constants/messages';

dotenv.config();

export const generateMoreOrUpscaleAwaitStep = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return sendSomethingWentWrong(ctx);
        ctx.wizard.next();
    } catch (e) {
        console.error('Error msg', e);
        return sendSomethingWentWrong(ctx);
    }
};

export const generateMoreOrUpscaleStep = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (!await checkIsGroupMember(ctx)) return;
        const session = ctx.session as { isHasOutstandingRequest: boolean };
        if (session.isHasOutstandingRequest) return sendHasOutstandingRequestMessage(ctx);

        const callback = ctx.update && 'callback_query' in ctx.update ? ctx.update.callback_query : undefined;
        const callbackData = callback && 'data' in callback ? callback.data : '';

        const isHasCompletedRequest = await findQueryInDB({ action: callbackData });
        if (isHasCompletedRequest.result) return sendHasCompletedRequestMessage(ctx);

        const queryId = callbackData?.split('!!!')[0] || '';
        const button = callbackData?.split('!!!')[1] || '';
        const { buttons, discordMsgId, prompt, flags } = await getQuery({ _id: queryId });
        const allCustomButtons = JSON.parse(buttons) as Record<string, string>;
        const custom = allCustomButtons[button];
        const waitMessage = await sendWaitMessage(ctx);

        const { _id } = await saveQueryInDB(ctx, prompt);

        if (custom.includes('upsample')) {
            client
                .Custom({
                    msgId: discordMsgId,
                    flags: +flags,
                    customId: custom,
                    loading: (uri: string, progress: string) => {
                        ctx.telegram.editMessageCaption(
                            waitMessage.chat.id,
                            waitMessage.message_id,
                            '0',
                            `Download photo...`
                        );
                    }
                })
                .then(async (Upscale: MJMessage | null) => {
                    if (!Upscale) return sendSomethingWentWrong(ctx);

                    ctx.telegram.editMessageCaption(
                        waitMessage.chat.id,
                        waitMessage.message_id,
                        '0',
                        `Download photo...`
                    );
                    ctx.replyWithPhoto(
                        { url: Upscale.uri },
                        {
                            parse_mode: 'Markdown',
                            caption: messageResult(prompt)
                        }
                    ).then(resultMessage => {
                        ctx.deleteMessage(waitMessage.message_id);
                        const chatId = process.env.GROUP_ID as string;

                        if (ReplayToGroup()) {
                            ctx.telegram.forwardMessage(chatId, resultMessage.chat.id, resultMessage.message_id);
                        }
                    }).catch((e) => {
                        console.log('xzxz', e);
                        ctx.deleteMessage(waitMessage.message_id);
                        return sendSomethingWentWrong(ctx);
                    });

                    updateQueryInDB({
                        _id,
                        action: callbackData,
                        buttons: '',
                        discordMsgId: Upscale.id || '',
                        flags: Upscale.flags.toString()
                    }, ctx);
                    ctx.scene.leave();
                })
                .catch((e) => {
                    console.log('xzxz22', e);
                    updateQueryInDB({
                        _id,
                        action: 'xzxz22',
                        buttons: '',
                        discordMsgId: '',
                        flags: ''
                    }, ctx);

                    ctx.deleteMessage(waitMessage.message_id);
                    return sendSomethingWentWrong(ctx);
                });
        } else if (custom.includes('variation')) {
            client
                .Custom({
                    msgId: discordMsgId,
                    flags: +flags,
                    customId: custom,
                    content: prompt, //remix mode require content
                    loading: (uri: string, progress: string) => sendLoadingMesage(ctx, waitMessage, progress)
                })
                .then((Variation: MJMessage | null) => {
                    if (!Variation) return sendSomethingWentWrong(ctx);
                    sendDownloadPhotoInProgressMesage(ctx, waitMessage);

                    ctx.replyWithPhoto({ url: Variation.uri }, Markup.inlineKeyboard(getButtonsForFourPhoto(_id))).then(
                        () => {
                            ctx.deleteMessage(waitMessage.message_id);
                        }
                    );

                    const dataButtons = JSON.stringify(getDataButtonsForFourPhoto(Variation));
                    updateQueryInDB({
                        _id,
                        action: callbackData,
                        buttons: dataButtons,
                        discordMsgId: Variation.id || '',
                        flags: Variation.flags.toString()
                    }, ctx);

                    ctx.scene.leave();
                })
                .catch((e) => {
                    console.log('xzxz333', e);
                    updateQueryInDB({
                        _id,
                        action: 'xzxz333',
                        buttons: '',
                        discordMsgId: '',
                        flags: ''
                    }, ctx);
                    ctx.deleteMessage(waitMessage.message_id);
                    return sendSomethingWentWrong(ctx);
                });
        } else if (custom.includes('reroll')) {
            client
                .Imagine(prompt, (uri: string, progress: string) => sendLoadingMesage(ctx, waitMessage, progress))
                .then((Imagine: MJMessage | null) => {
                    if (!Imagine) return sendSomethingWentWrong(ctx);
                    sendDownloadPhotoInProgressMesage(ctx, waitMessage);

                    ctx.replyWithPhoto({ url: Imagine.uri }, {
                        reply_markup: Markup.inlineKeyboard(getButtonsForFourPhoto(_id)).reply_markup,
                        parse_mode: 'Markdown'
                    }).then(
                        () => {
                            ctx.deleteMessage(waitMessage.message_id);
                        }
                    );

                    const dataButtons = JSON.stringify(getDataButtonsForFourPhoto(Imagine));
                    updateQueryInDB({
                        _id,
                        action: callbackData,
                        buttons: dataButtons,
                        discordMsgId: Imagine.id || '',
                        flags: Imagine.flags.toString()
                    }, ctx);

                    ctx.scene.leave();
                })
                .catch((e) => {
                    console.log('xzxz444', e);
                    updateQueryInDB({
                        _id,
                        action: 'xzxz444',
                        buttons: '',
                        discordMsgId: '',
                        flags: ''
                    }, ctx);
                    ctx.deleteMessage(waitMessage.message_id);
                    return sendSomethingWentWrong(ctx);
                });
        }
    } catch (e) {
        console.error('Error msg', e);
        return sendSomethingWentWrong(ctx);
    }
};
