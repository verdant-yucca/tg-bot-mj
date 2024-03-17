import { Scenes } from 'telegraf';

import { Commands, ReplyMarkup } from '../types';

export const wrapCommandsMarkup = (commands: Commands): ReplyMarkup => ({
    reply_markup: {
        inline_keyboard: commands,
    },
});

export const exitOfBot = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    ctx.replyWithHTML('By by');
    ctx.scene.leave();
};
