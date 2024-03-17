import { Scenes } from 'telegraf';
import { greetingsMsg, somethingWentWrong } from '../constants/messages';
import { IStateData, ITGData } from '../types';
import { API } from '../api';
import { getMainMenu } from '../constants/buttons';
import { sendSomethingWentWrong } from '../utils/sendLoading';

export const startSceneStep = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
            ctx.replyWithHTML(somethingWentWrong());
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

        await API.auth.tgAuth({
            chatId: id.toString(),
            languageCode: language_code,
            username: username || `${first_name}_${id}`,
            firstName: first_name,
            lastName: last_name || '',
            avatarPath
        });

        ctx.reply(greetingsMsg(first_name), getMainMenu());

        return ctx.scene.leave();
    } catch (e) {
        console.error('Error msg', e);
        return sendSomethingWentWrong(ctx);
    }
};
