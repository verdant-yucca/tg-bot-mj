import { Scenes } from 'telegraf';

import { exitMsg } from '../constants/messages';
import { Commands, ReplyMarkup } from '../types';

export const wrapCommandsMarkup = (commands: Commands): ReplyMarkup => {
  return {
    reply_markup: {
      inline_keyboard: commands
    }
  };
};

export const exitOfBot = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
  ctx.replyWithHTML(exitMsg);
  ctx.scene.leave();
};
