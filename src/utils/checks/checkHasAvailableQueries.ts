import { Scenes } from 'telegraf';
import { getMainMenu } from '../../constants/buttons';
import { noRequestsAvailable } from '../../constants/messages';
import { getUserByIdFromDb } from '../db/saveUserInDb';

export const checkHasAvailableQueries = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const user = await getUserByIdFromDb(ctx);
        console.log(user);
        if ((user.countFreeQueries && +user.countFreeQueries) || (user.countQueries && +user.countQueries)) {
            return true;
        } else {
            ctx.replyWithHTML(noRequestsAvailable(), {
                parse_mode: 'Markdown',
                reply_markup: getMainMenu().reply_markup,
            });
            ctx.scene.leave();
            return false;
        }
    } catch (e) {
        console.error('checkHasAvailableQueries -> catch e', e);
        return true;
    }
};
