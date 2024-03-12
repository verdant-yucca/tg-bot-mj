import { Markup, Scenes } from 'telegraf';
import { notAccessMsg, somethingWentWrong } from '../../constants/messages';
import { client } from '../../setup/bot';
import { getButtonsForFourPhoto } from '../../utils/getButtonsForFourPhoto';
import { ITGData } from '../../types';

export const enterYourTextStep1 = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
            ctx.replyWithHTML(notAccessMsg);
            return ctx.scene.leave();
        }
        const { id } = ctx.from as ITGData;
        ctx.telegram.getUserProfilePhotos(id).then(async avatars => {

            const state = ctx.session as { avatarPath?: string };

            if (avatars.total_count > 0) {
                const fileId = avatars.photos[0][0].file_id;
                const file = await ctx.telegram.getFileLink(fileId).then(url => {
                        console.log('url', url);
                        state.avatarPath = url.toString();

                    }
                );
            }

            if (state.avatarPath) {
                ctx.replyWithHTML('Опишите, как вы хотите изменить свою аватарку:');
                ctx.wizard.next();
            } else {
                ctx.replyWithHTML('У вас нет аватарки в профиле. Данная функция не доступна');
                return ctx.scene.leave();
            }
        }).catch(() => {

            ctx.reply(somethingWentWrong);
        });

    } catch (err) {
        console.error('Error msg', err.message);
        console.error('Catch start:', err);
        ctx.reply(somethingWentWrong);
        ctx.scene.leave();
        return;
    }
};
export const stylingAvatarByTextStep2 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const { avatarPath } = ctx.session as { avatarPath: string };
        //https://i.yapx.ru/XFv9d.gif
        const waitMessage = await ctx.replyWithDocument({
            url: 'https://i.yapx.ru/XFv9d.gif',
            filename: 'XFv9d.gif'
        }, {
            caption: `Ваш запрос добавлен в очередь. Пожалуйста, ожидайте.`
        });
        //@ts-ignore
        const prompt: string = `${avatarPath} ${ctx.update.message.text}`;
        client.Imagine(
            prompt,
            (uri: string, progress: string) => {
                ctx.telegram.editMessageCaption(waitMessage.chat.id, waitMessage.message_id, '0', `
                        Генерация займёт 0-10 минут. Пожалуйста, ожидайте.
Выполнено: ${progress}
                    `);
            }
        ).then(Imagine => {
            if (!Imagine) {
                console.log('no message');
                ctx.scene.leave();
                return;
            }
            ctx.telegram.editMessageCaption(waitMessage.chat.id, waitMessage.message_id, '0', `
                        Генерация займёт 0-10 минут. Пожалуйста, ожидайте.
Выполнено: 100%
Download photo...
                    `);
            //U1 U2 U3 U4 V1 V2 V3 V4  "Vary (Strong)" ...
            const buttons = getButtonsForFourPhoto(Imagine);
            console.log('buttons', buttons);
            ctx.replyWithPhoto({ url: Imagine.uri }, Markup.inlineKeyboard(buttons)).then(() => {
                ctx.deleteMessage(waitMessage.message_id);
            });

            //@ts-ignore
            ctx.session.result = Imagine;
            //@ts-ignore
            ctx.session.prompt = prompt;
            //@ts-ignore
            ctx.session.withoutFirstStep = true;
            ctx.scene.leave();
            ctx.scene.enter('generateMoreOrUpscaleScene');
        });
    } catch (err) {
        console.error('Error msg', err.message);
        console.error('Catch start:', err);
        ctx.reply(somethingWentWrong);
        ctx.scene.leave();
        return;
    }
};
