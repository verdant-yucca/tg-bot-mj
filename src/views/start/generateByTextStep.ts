import { Scenes } from 'telegraf';
import { notAccessMsg, somethingWentWrong } from '../../constants/messages';
import path_1 from 'path';
import Replicate from 'replicate';
import { getMainMenu } from '../../constants/buttons';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export const generateByTextStep1 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
            ctx.replyWithHTML(notAccessMsg);
            return ctx.scene.leave();
        }
        await ctx.replyWithHTML('Введите свой запрос:');
        return ctx.wizard.next();
    } catch (err) {
        console.error('Error msg', err.message);
        console.error('Catch start:', err);
        ctx.reply(somethingWentWrong);
    }
};
export const generateByTextStep2 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        ctx.replyWithHTML('Генерация изображения займёт около 30 секунд. Ожидайте.');

        //@ts-ignore
        const answer = ctx.update.message.text;

        const output = await replicate.run(
            "asiryan/kandinsky-3.0:706edd88577cccfa826404969330e3d9121ad98ea3336acfcab8873a837070e2",
            {
                input: {
                    width: 1024,
                    height: 1024,
                    prompt: answer,
                    strength: 0.75,
                    negative_prompt: "",
                    num_inference_steps: 50
                }
            }
        );

        ctx.replyWithHTML('Какой запрос, такой и результат');

        const pathPicture = path_1.join(__dirname + '../../../static/test_img.jpg');
        console.log('pathPicture', pathPicture);
        ctx.replyWithPhoto({ url: output.toString() });

        return ctx.scene.leave();
    } catch (err) {
        console.error('Error msg', err.message);
        console.error('Catch start:', err);
        ctx.reply(somethingWentWrong);
    }
};

export const generateByTextStep3 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        console.log('ctx', ctx);
        ctx.replyWithHTML('Какой запрос, такой и результат');

        const pathPicture = path_1.join(__dirname + '../../../static/test_img.jpg');
        console.log('pathPicture', pathPicture);
        ctx.replyWithPhoto({ source: pathPicture });

        return ctx.scene.leave();
    } catch (err) {
        console.error('Error msg', err.message);
        console.error('Catch start:', err);
        ctx.reply(somethingWentWrong);
    }
};
