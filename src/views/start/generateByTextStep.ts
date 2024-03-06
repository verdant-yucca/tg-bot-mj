import { Scenes } from 'telegraf';
import { greetingsMsg, notAccessMsg, somethingWentWrong } from '../../constants/messages';
import { IStateData, ITGData } from '../../types';
import { API } from '../../api';
import { getMainMenu } from '../../constants/buttons';
import path_1 from 'path';

export const generateByTextStep = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
            ctx.replyWithHTML(notAccessMsg);
            return ctx.scene.leave();
        }

        const searchText = await ctx.replyWithHTML('Введите свой запрос:');
        //TODO разобраться как дождаться ответа
        if (searchText) {
            ctx.replyWithHTML('Какой запрос, такой и результат')
            const pathPicture = path_1.join(__dirname + '../../../static/test_img.jpg');
            console.log('pathPicture', pathPicture);
            ctx.replyWithPhoto({ source: pathPicture });
        }
        return ctx.scene.leave();
    } catch (err) {
        console.error('Error msg', err.message);
        console.error('Catch start:', err);
        ctx.reply(somethingWentWrong);
    }
};
