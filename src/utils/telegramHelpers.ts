import { Scenes } from 'telegraf';

import { ITGData } from '../types';
import { API } from '../api';

export const exitOfBot = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    const { id } = ctx.from as ITGData;
    await API.auth.tgAuth({
        chatId: id.toString(),
        left: true,
    });

    ctx.replyWithHTML('By by', { parse_mode: 'Markdown' });
    ctx.scene.leave();
};
