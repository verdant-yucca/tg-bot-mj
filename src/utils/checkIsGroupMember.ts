import { Scenes } from 'telegraf';
import * as dotenv from 'dotenv';

dotenv.config();

export const checkIsGroupMember = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    const chatId = process.env.GROUP_ID as string;
    const userId = ctx.chat?.id;
    if (!userId) {
        ctx.replyWithHTML('Чтобы пользоваться ботом, подпишитесь на группу! https://t.me/+55XysIt_M9U4NWZi');
        ctx.scene.leave();
        return false;
    }

    const member = await ctx.telegram.getChatMember(chatId, ctx.chat?.id);
    if (member.status != 'member' && member.status != 'administrator' && member.status != 'creator') {
        ctx.replyWithHTML('Чтобы пользоваться ботом, подпишитесь на группу! https://t.me/+55XysIt_M9U4NWZi');
        ctx.scene.leave();
        return false;
    } else {
        return true;
    }
};