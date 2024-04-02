// import { Markup, Scenes } from 'telegraf';
// import { MJMessage } from 'midjourney';
// import MidjourneyClient from '../setup/MidjourneyClient';
// import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../utils/getButtonsForFourPhoto';
// import { ITGData } from '../types';
// import {
//     sendBadRequestMessage,
//     sendDownloadPhotoInProgressMesage,
//     sendHasOutstandingRequestMessage,
//     sendLoadingMesage,
//     sendSomethingWentWrong,
//     sendWaitMessage,
// } from '../utils/sendLoading';
// import { saveQueryInDB, updateQueryInDB } from '../utils';
// import { checkIsGroupMember } from '../utils/checkIsGroupMember';
// import { getTranslatePrompt } from '../utils/getTranslatePrompt';
// import { messageEnterYourTextForStylingAvatar, messageNoAvatarInProfile } from '../constants/messages';
//
// export const enterYourTextStep1 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
//     try {
//         if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return sendSomethingWentWrong(ctx);
//         if (!(await checkIsGroupMember(ctx))) return;
//         const session = ctx.session as { isHasOutstandingRequest: boolean };
//         if (session.isHasOutstandingRequest) return sendHasOutstandingRequestMessage(ctx);
//
//         const { id } = ctx.from as ITGData;
//         ctx.telegram
//             .getUserProfilePhotos(id)
//             .then(async avatars => {
//                 const state = ctx.session as { avatarPath?: string };
//
//                 if (avatars.total_count > 0) {
//                     const fileId = avatars.photos[0][2].file_id;
//                     ctx.telegram
//                         .getFileLink(fileId)
//                         .then(url => {
//                             state.avatarPath = url.toString();
//
//                             if (state.avatarPath) {
//                                 ctx.replyWithHTML(messageEnterYourTextForStylingAvatar(), { parse_mode: 'Markdown' });
//                                 ctx.wizard.next();
//                             } else {
//                                 ctx.replyWithHTML(messageNoAvatarInProfile(), { parse_mode: 'Markdown' });
//                                 return ctx.scene.leave();
//                             }
//                         })
//                         .catch(() => sendSomethingWentWrong(ctx));
//                 } else {
//                     return sendSomethingWentWrong(ctx);
//                 }
//             })
//             .catch(() => sendSomethingWentWrong(ctx));
//     } catch (e) {
//         console.error('Error msg', e);
//         return sendSomethingWentWrong(ctx);
//     }
// };
// export const stylingAvatarByTextStep2 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
//     try {
//         const { avatarPath } = ctx.session as { avatarPath: string };
//         const tgMessage = 'message' in ctx.update ? ctx.update.message : undefined;
//         const textTgMessage = tgMessage && 'text' in tgMessage && tgMessage.text;
//         let translatedTgMessage = textTgMessage;
//         if (textTgMessage) {
//             translatedTgMessage = await getTranslatePrompt(textTgMessage);
//         }
//         const prompt = `${avatarPath} ${translatedTgMessage}`;
//         const { _id } = await saveQueryInDB(ctx, prompt);
//
//         const waitMessage = await sendWaitMessage(ctx);
//
//         MidjourneyClient.Imagine(prompt, (uri: string, progress: string) =>
//             sendLoadingMesage(ctx, waitMessage, progress),
//         )
//             .then((Imagine: MJMessage | null) => {
//                 if (!Imagine) return sendSomethingWentWrong(ctx);
//                 sendDownloadPhotoInProgressMesage(ctx, waitMessage);
//                 ctx.replyWithPhoto(
//                     { url: Imagine.uri },
//                     {
//                         reply_markup: Markup.inlineKeyboard(getButtonsForFourPhoto(_id)).reply_markup,
//                         parse_mode: 'Markdown',
//                     },
//                 ).then(() => {
//                     ctx.deleteMessage(waitMessage.message_id);
//                 });
//
//                 const dataButtons = JSON.stringify(getDataButtonsForFourPhoto(Imagine));
//                 updateQueryInDB(
//                     {
//                         _id,
//                         action: 'stylingAvatarByText',
//                         buttons: dataButtons,
//                         discordMsgId: Imagine.id || '',
//                         flags: Imagine.flags.toString(),
//                     },
//                     ctx,
//                 );
//
//                 ctx.scene.leave();
//             })
//             .catch(() => {
//                 ctx.deleteMessage(waitMessage.message_id);
//                 return sendBadRequestMessage(ctx);
//             });
//     } catch (e) {
//         console.error('Error msg', e);
//         return sendSomethingWentWrong(ctx);
//     }
// };
