import { Markup, Scenes } from 'telegraf';
import * as dotenv from 'dotenv';
import { inNotGroupMember, needCheckIsGroupMember, textButtonAlreadySubscribed } from '../../constants/messages';

dotenv.config();

export const checkIsGroupMember = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const chatId = process.env.GROUP_ID as string;
        //@ts-ignore
        const userId = ctx?.chat?.id || ctx?.message?.from?.id || ctx?.update?.callback_query?.from.id;

        //если в константах указано что проверка не нужна, возвращаем истину = проверка прошла
        if (!needCheckIsGroupMember()) return true;

        if (!userId) {
            ctx.replyWithHTML(inNotGroupMember(), {
                reply_markup: Markup.inlineKeyboard([
                    [Markup.button.callback(textButtonAlreadySubscribed(), textButtonAlreadySubscribed())],
                ]).reply_markup,
            });
            ctx.scene.leave();
            return false;
        }

        const member = await ctx.telegram.getChatMember(chatId, userId);
        if (member.status != 'member' && member.status != 'administrator' && member.status != 'creator') {
            ctx.replyWithHTML(inNotGroupMember(), {
                reply_markup: Markup.inlineKeyboard([
                    [Markup.button.callback(textButtonAlreadySubscribed(), textButtonAlreadySubscribed())],
                ]).reply_markup,
            });
            ctx.scene.leave();
            return false;
        } else {
            return true;
        }
    } catch (e) {
        console.error('checkIsGroupMember -> catch e', e);
        return true;
    }
};
