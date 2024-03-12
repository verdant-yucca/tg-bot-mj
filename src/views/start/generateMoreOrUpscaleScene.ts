import { Markup, Scenes } from 'telegraf';
import { notAccessMsg, somethingWentWrong } from '../../constants/messages';
import { client } from '../../setup/bot';
import { getButtonsForFourPhoto } from '../../utils/getButtonsForFourPhoto';

export const generateMoreOrUpscaleAwaitStep = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
            ctx.replyWithHTML(notAccessMsg);
            return ctx.scene.leave();
        }

        ctx.wizard.next();
    } catch (err) {
        console.error('Error msg', err.message);
        console.error('Catch start:', err);
        ctx.reply(somethingWentWrong);
        ctx.scene.leave();
        return;
    }
};

export const generateMoreOrUpscaleStep = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        //@ts-ignore
        const result = ctx.session.result;
        //@ts-ignore
        const prompt = ctx.session.prompt;
        //@ts-ignore
        const custom = ctx.update?.callback_query?.data || '' as string;

        const waitMessage = await ctx.replyWithDocument({
            url: 'https://i.yapx.ru/XFv9d.gif',
            filename: 'XFv9d.gif'
        }, {
            caption: `Ваш запрос добавлен в очередь. Пожалуйста, ожидайте.`
        });

        const id = (result?.id || '') as string;
        const flags = (result?.flags || 0) as number;
        if (custom.includes('upsample')) {
            client.Custom({
                msgId: id,
                flags: flags,
                customId: custom,
                loading: (uri: string, progress: string) => {
                    ctx.telegram.editMessageCaption(waitMessage.chat.id, waitMessage.message_id, '0', `Download photo...`);
                }
            }).then(async Upscale => {
                    if (!Upscale) return;
                    ctx.telegram.editMessageCaption(waitMessage.chat.id, waitMessage.message_id, '0', `Download photo...`);
                    ctx.replyWithPhoto({ url: Upscale.uri }, {
                        caption: `Изображение по запросу:
${prompt}`
                    }).then(resultMessage => {
                        ctx.deleteMessage(waitMessage.message_id);
                        const chatId = process.env.GROUP_ID as string;
                        ctx.telegram.forwardMessage(chatId, resultMessage.chat.id, resultMessage.message_id);
                    });
                    ctx.scene.leave();
                    // const zoomout = Upscale?.options?.find((o) => o.label === 'Custom Zoom').custom as string;
                    // client.Custom({
                    //     msgId: Upscale.id,
                    //     flags: Upscale.flags,
                    //     content: `${prompt} --zoom 2`,
                    //     customId: zoomout,
                    //     loading: (uri: string, progress: string) => {
                    //         ctx.reply(`progress: ${progress}`);
                    //     }
                    // }).then(CustomZoomout => {
                    //     if (!CustomZoomout) return;
                    //     ctx.replyWithPhoto({ url: CustomZoomout.uri });
                    //     ctx.scene.leave();
                    // });
                }
            );
        } else if (custom.includes('variation')) {
            client.Custom({
                msgId: id,
                flags: flags,
                customId: custom,
                content: prompt, //remix mode require content
                loading: (uri: string, progress: string) => {
                    ctx.telegram.editMessageCaption(waitMessage.chat.id, waitMessage.message_id, '0', `
                        Генерация займёт 0-10 минут. Пожалуйста, ожидайте.
Выполнено: ${progress}
                    `);
                }
            }).then(Variation => {
                if (!Variation) {
                    console.log('no message');
                    ctx.scene.leave();
                    return;
                }
                //U1 U2 U3 U4 V1 V2 V3 V4  "Vary (Strong)" ...
                const buttons = getButtonsForFourPhoto(Variation);

                ctx.replyWithPhoto({ url: Variation.uri }, Markup.inlineKeyboard(buttons)).then(() => {
                    ctx.deleteMessage(waitMessage.message_id);
                });
                //@ts-ignore
                ctx.session.result = Variation;
                //@ts-ignore
                ctx.session.prompt = prompt;
                ctx.scene.leave();

                ctx.scene.enter('generateMoreOrUpscaleScene');
            });
        } else if (custom.includes('reroll')) {
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
        }
    } catch (err) {
        console.error('Error msg', err.message);
        console.error('Catch start:', err);
        ctx.reply(somethingWentWrong);
        ctx.scene.leave();
        return;
    }
};
