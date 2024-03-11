import { Markup, Scenes } from 'telegraf';
import { notAccessMsg, somethingWentWrong } from '../../constants/messages';
import { client } from '../../setup/bot';
import { getButtonsForFourPhoto } from '../../utils/getButtonsForFourPhoto';

export const enterYourTextStep1 = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
            ctx.replyWithHTML(notAccessMsg);
            return ctx.scene.leave();
        }
        ctx.replyWithHTML('Введите свой запрос:');
        ctx.wizard.next();
    } catch (err) {
        console.error('Error msg', err.message);
        console.error('Catch start:', err);
        ctx.reply(somethingWentWrong);
        ctx.scene.leave();
        return;
    }
};
export const generateImageByTextStep2 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        ctx.replyWithHTML('Генерация изображения займёт около 30 секунд. Ожидайте.');

        //@ts-ignore
        const prompt: string = ctx.update.message.text;
        client.Imagine(
            prompt,
            (uri: string, progress: string) => {
                ctx.reply(`progress: ${progress}`);
            }
        ).then(Imagine => {
            if (!Imagine) {
                console.log('no message');
                ctx.scene.leave();
                return;
            }

            //U1 U2 U3 U4 V1 V2 V3 V4  "Vary (Strong)" ...
            const buttons = getButtonsForFourPhoto(Imagine);
            ctx.replyWithPhoto({ url: Imagine.uri }, Markup.inlineKeyboard(buttons));
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
