import { Scenes } from 'telegraf';

import { IStateData, ITGData } from '../../types';
import { greetingsMsg, notAccessMsg, somethingWentWrong } from '../../constants/messages';
import { API } from '../../api';

export const stepStart = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
  try {
    if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
      ctx.replyWithHTML(notAccessMsg);
      return ctx.scene.leave();
    }

    const state = ctx.wizard.state as IStateData;
    const { id, language_code, username, first_name, last_name } = ctx.from as ITGData;
    const avatars = await ctx.telegram.getUserProfilePhotos(id);
    let avatarPath: string | undefined = undefined;

    if (avatars.total_count > 0) {
      const fileId = avatars.photos[0][0].file_id;
      const file = await ctx.telegram.getFile(fileId);
      avatarPath = file.file_path;
    }

    const { jwt, user } = await API.auth.tgAuth({
      chatId: id.toString(),
      languageCode: language_code,
      username: username || `${first_name}_${id}`,
      firstName: first_name,
      lastName: last_name || '',
      avatarPath
    });

    state.jwt = jwt;
    state.user = user;

    ctx.replyWithHTML(greetingsMsg(state.user.firstName));
    return ctx.scene.leave();
  } catch (err) {
    console.error('Error msg', err.message);
    console.error('Catch start:', err);
    ctx.reply(somethingWentWrong);
  }
};
