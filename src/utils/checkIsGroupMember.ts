import { Scenes } from 'telegraf';
import * as dotenv from 'dotenv';
import { inNotGroupMember } from '../constants/messages';

dotenv.config();

export const checkIsGroupMember = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    const chatId = process.env.GROUP_ID as string;
    const userId = ctx.chat?.id;
    if (!userId) {
        ctx.replyWithHTML(inNotGroupMember());
        ctx.scene.leave();
        return false;
    }

    const member = await ctx.telegram.getChatMember(chatId, ctx.chat?.id);
    if (member.status != 'member' && member.status != 'administrator' && member.status != 'creator') {
        ctx.replyWithHTML(inNotGroupMember());
        ctx.scene.leave();
        return false;
    } else {
        return true;
    }
};
