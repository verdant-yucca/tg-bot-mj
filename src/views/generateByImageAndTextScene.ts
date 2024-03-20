import { Markup, Scenes } from 'telegraf';
import { MJMessage } from 'midjourney';
import { client } from '../setup/bot';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../utils/getButtonsForFourPhoto';
import {
    sendBadRequestMessage,
    sendDownloadPhotoInProgressMesage, sendHasOutstandingRequestMessage,
    sendLoadingMesage,
    sendSomethingWentWrong,
    sendWaitMessage
} from '../utils/sendLoading';
import { saveQueryInDB, updateQueryInDB } from '../utils';
import { checkIsGroupMember } from '../utils/checkIsGroupMember';
import { getTranslatePrompt } from '../utils/getTranslatePrompt';
import {
    messageEnterImageForStylingImage,
    messageEnterTextForStylingImage
} from '../constants/messages';
import axios from 'axios';
import * as fs from 'fs';

export const enterYourImageStep1 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return sendSomethingWentWrong(ctx);
        if (!await checkIsGroupMember(ctx)) return;
        const session = ctx.session as { isHasOutstandingRequest: boolean };
        if (session.isHasOutstandingRequest) return sendHasOutstandingRequestMessage(ctx);
        ctx.replyWithHTML(messageEnterImageForStylingImage(), { parse_mode: 'Markdown' });
        ctx.wizard.next();
    } catch (e) {
        console.error('Error msg', e);
        return sendSomethingWentWrong(ctx);
    }
};

export const enterYourTextStep2 = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return sendSomethingWentWrong(ctx);
        const tgMessage = ctx.message;
        const photoTgMessage = tgMessage && 'photo' in tgMessage ? tgMessage.photo : undefined;

        if (photoTgMessage && photoTgMessage.length > 0) {
            const state = ctx.session as { imageUrl?: string };
            const fileId = photoTgMessage[2].file_id;

            ctx.telegram
                .getFileLink(fileId)
                .then(async url => {
                    const ext = url.toString().split('.');
                    const currentExt = ext[ext.length-1]
                    const fileName = `${fileId}.${currentExt}`; // или какой-то другой формат

                    // const fileInfo = await ctx.telegram.getFile(fileId)
                    // console.log('fileInfo', fileInfo);
                    // const localPath = `../static/${fileName}`;
                    // //@ts-ignore
                    // const res = await ctx.telegram.downloadFile(fileInfo.file_path, localPath);

                    // @ts-ignore
                    const response = await axios({url, responseType: 'stream'})

                    await new Promise((resolve, reject) => {
                        // @ts-ignore
                        response.data.pipe(fs.createWriteStream(`./src/static/${fileId}.jpg`))
                            .on('finish', () => resolve(''))
                            .on('error', (e: any) => {
                                console.log(e);
                                reject()
                            })
                    })

                    console.log(`http://158.160.142.41:3001/static/${fileId}.jpg`);
                    state.imageUrl = `http://158.160.142.41:3001/static/${fileId}.jpg`

                    if (state.imageUrl) {
                        ctx.replyWithHTML(messageEnterTextForStylingImage(), { parse_mode: 'Markdown' });
                        ctx.wizard.next();
                    } else {
                        return sendSomethingWentWrong(ctx);
                    }
                })
                .catch(() => sendSomethingWentWrong(ctx));
        } else {
            return sendSomethingWentWrong(ctx);
        }
    } catch (e) {
        console.error('Error msg', e);
        return sendSomethingWentWrong(ctx);
    }
};
export const stylingImageByTextStep3 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const { imageUrl } = ctx.session as { imageUrl?: string };
        const tgMessage = 'message' in ctx.update ? ctx.update.message : undefined;
        const textTgMessage = tgMessage && 'text' in tgMessage ? tgMessage.text : '';
        let translatedTgMessage = textTgMessage;
        if (textTgMessage) {
            translatedTgMessage = await getTranslatePrompt(textTgMessage);
        }
        console.log(imageUrl);
        const prompt = `${imageUrl} ${translatedTgMessage}`;
        const { _id } = await saveQueryInDB(ctx, prompt);

        const waitMessage = await sendWaitMessage(ctx);

        client
            .Imagine(prompt, (uri: string, progress: string) => sendLoadingMesage(ctx, waitMessage, progress))
            .then((Imagine: MJMessage | null) => {
                if (!Imagine) return sendSomethingWentWrong(ctx);
                sendDownloadPhotoInProgressMesage(ctx, waitMessage);

                ctx.replyWithPhoto({ url: Imagine.uri }, { reply_markup: Markup.inlineKeyboard(getButtonsForFourPhoto(_id)).reply_markup, parse_mode: 'Markdown'}).then(
                    () => {
                        ctx.deleteMessage(waitMessage.message_id);
                    }
                );

                const dataButtons = JSON.stringify(getDataButtonsForFourPhoto(Imagine));
                updateQueryInDB({
                    _id,
                    action: 'stylingImageByText',
                    buttons: dataButtons,
                    discordMsgId: Imagine.id || '',
                    flags: Imagine.flags.toString()
                }, ctx);

                return ctx.scene.leave();
            })
            .catch(() => {
                const session = ctx.session as { isHasOutstandingRequest: boolean };
                session.isHasOutstandingRequest = false;
                ctx.deleteMessage(waitMessage.message_id);
                return sendBadRequestMessage(ctx);
            });
    } catch (e) {
        console.error('Error msg', e);
        return sendSomethingWentWrong(ctx);
    }
};
