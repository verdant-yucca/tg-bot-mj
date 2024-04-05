import { Scenes } from 'telegraf';
import { countFreeRequest, greetingsMsg, somethingWentWrong } from '../../../constants/messages';
import { ITGData } from '../../../types';
import { API } from '../../../api';
import { getMainMenu } from '../../../constants/buttons';
import { sendSomethingWentWrong } from '../../../utils/sendLoading';
import { checkIsGroupMember } from '../../../utils/checks/checkIsGroupMember';
import { escapeTelegrafMarkdown } from '../../../utils/escapeTelegrafMarkdown';

export const startSceneStep = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
            ctx.replyWithHTML(somethingWentWrong(), { parse_mode: 'Markdown' });
            return ctx.scene.leave();
        }

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
            languageCode: language_code || 'ru',
            username: username || '',
            firstName: first_name,
            lastName: last_name || '',
            avatarPath,
            countFreeQueries: countFreeRequest(),
        });

        if (!(await checkIsGroupMember(ctx))) return;

        ctx.replyWithHTML(greetingsMsg(escapeTelegrafMarkdown(first_name)), {
            reply_markup: getMainMenu().reply_markup,
            parse_mode: 'Markdown',
        });

        return ctx.scene.leave();
    } catch (e) {
        console.error('startSceneStep -> catch', e);
        const chatId = (ctx.from as ITGData).id.toString();
        sendSomethingWentWrong(chatId);
        return ctx.scene.leave();
    }
};
