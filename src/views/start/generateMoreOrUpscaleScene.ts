import { Markup, Scenes } from 'telegraf';
import { somethingWentWrong } from '../../constants/messages';
import { client } from '../../setup/bot';
import { getButtonsForFourPhoto } from '../../utils/getButtonsForFourPhoto';

export const generateMoreOrUpscaleStep = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        console.log('ctx', ctx);
        //@ts-ignore
        const result = ctx.session.state.result;
        //@ts-ignore
        const prompt = ctx.session.state.prompt;
        //@ts-ignore
        const custom = ctx.update?.callback_query?.data || '' as string;
        const id = (result?.id || '') as string;
        const flags = (result?.flags || 0) as number;
        if (custom.includes('upsample')) {
            client.Custom({
                msgId: id,
                flags: flags,
                customId: custom,
                loading: (uri: string, progress: string) => {
                    ctx.reply(`progress: ${progress}`);
                }
            }).then(Upscale => {
                    if (!Upscale) return;
                    const zoomout = Upscale?.options?.find((o) => o.label === 'Custom Zoom').custom as string;
                    client.Custom({
                        msgId: Upscale.id,
                        flags: Upscale.flags,
                        content: `${prompt} --zoom 2`,
                        customId: zoomout,
                        loading: (uri: string, progress: string) => {
                            ctx.reply(`progress: ${progress}`);
                        }
                    }).then(CustomZoomout => {
                        if (!CustomZoomout) return;
                        ctx.replyWithPhoto({ url: CustomZoomout.uri });
                        ctx.scene.leave();
                    });
                }
            );
        } else if (custom.includes('variation')) {
            client.Custom({
                msgId: id,
                flags: flags,
                customId: custom,
                content: prompt, //remix mode require content
                loading: (uri: string, progress: string) => {
                    ctx.reply(`progress: ${progress}`);
                }
            }).then(Variation => {
                if (!Variation) {
                    console.log('no message');
                    ctx.scene.leave();
                    return;
                }
                //U1 U2 U3 U4 V1 V2 V3 V4  "Vary (Strong)" ...
                const buttons = getButtonsForFourPhoto(Variation);

                ctx.replyWithPhoto({ url: Variation.uri }, Markup.inlineKeyboard(buttons));
                //@ts-ignore
                ctx.session.state = {
                    result: Variation,
                    prompt
                };
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
