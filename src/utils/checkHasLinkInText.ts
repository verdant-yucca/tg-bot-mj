import { getMainMenu } from '../constants/buttons';
import { Scenes } from 'telegraf';
import { prohibitedSendingLinks } from '../constants/messages';

export const checkHasLinkInText = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>, prompt: string) => {
    let isHasLinkInText = false;
    const regex = /https?:\/\/\S+/g;
    const withLinkInMessage = regex.test(prompt);
    if (withLinkInMessage) {
        isHasLinkInText = true;
        ctx.replyWithHTML(prohibitedSendingLinks(), {
            parse_mode: 'Markdown',
            reply_markup: getMainMenu().reply_markup,
        });
        ctx.scene.leave();
    }
    return isHasLinkInText;
};
