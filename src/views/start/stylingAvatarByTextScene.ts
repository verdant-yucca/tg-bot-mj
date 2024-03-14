import { Markup, Scenes } from 'telegraf';
import { client } from '../../setup/bot';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../../utils/getButtonsForFourPhoto';
import { ITGData } from '../../types';
import {
    sendBadRequestMessage,
    sendDownloadPhotoInProgressMesage,
    sendLoadingMesage,
    sendSomethingWentWrong,
    sendWaitMessage,
} from '../../utils/sendLoading';
import { saveQueryInDB, updateQueryInDB } from '../../utils';

export const enterYourTextStep1 = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return sendSomethingWentWrong(ctx);
        const { id } = ctx.from as ITGData;
        ctx.telegram
            .getUserProfilePhotos(id)
            .then(async avatars => {
                const state = ctx.session as { avatarPath?: string };

                if (avatars.total_count > 0) {
                    const fileId = avatars.photos[0][0].file_id;
                    ctx.telegram
                        .getFileLink(fileId)
                        .then(url => {
                            state.avatarPath = url.toString();

                            if (state.avatarPath) {
                                ctx.replyWithHTML('Опишите, как вы хотите изменить свою аватарку:');
                                ctx.wizard.next();
                            } else {
                                ctx.replyWithHTML('У вас нет аватарки в профиле. Данная функция не доступна');
                                return ctx.scene.leave();
                            }
                        })
                        .catch(() => sendSomethingWentWrong(ctx));
                } else {
                    return sendSomethingWentWrong(ctx);
                }
            })
            .catch(() => sendSomethingWentWrong(ctx));
    } catch (err) {
        console.error('Error msg', err.message);
        return sendSomethingWentWrong(ctx);
    }
};
export const stylingAvatarByTextStep2 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const { avatarPath } = ctx.session as { avatarPath: string };
        const waitMessage = await sendWaitMessage(ctx);
        const prompt = `${avatarPath} ${ctx.update.message.text as string}`;
        const { _id } = await saveQueryInDB(ctx, prompt);

        client
            .Imagine(prompt, (uri: string, progress: string) => sendLoadingMesage(ctx, waitMessage, progress))
            .then(Imagine => {
                if (!Imagine) return sendSomethingWentWrong(ctx);
                sendDownloadPhotoInProgressMesage(ctx, waitMessage);
                ctx.replyWithPhoto({ url: Imagine.uri }, Markup.inlineKeyboard(getButtonsForFourPhoto(_id))).then(
                    () => {
                        ctx.deleteMessage(waitMessage.message_id);
                    },
                );

                const dataButtons = JSON.stringify(getDataButtonsForFourPhoto(Imagine));
                updateQueryInDB({
                    _id,
                    buttons: dataButtons,
                    discordMsgId: Imagine.id || '',
                    flags: Imagine.flags.toString(),
                });

                ctx.scene.leave();
                ctx.scene.enter('generateMoreOrUpscaleScene');
            })
            .catch(() => {
                ctx.deleteMessage(waitMessage.message_id);
                return sendBadRequestMessage(ctx);
            });
    } catch (err) {
        console.error('Error msg', err.message);
        return sendSomethingWentWrong(ctx);
    }
};
