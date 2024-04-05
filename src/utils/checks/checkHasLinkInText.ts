import { getMainMenu } from '../../constants/buttons';
import { Scenes } from 'telegraf';
import { prohibitedSendingLinks } from '../../constants/messages';

export const checkHasLinkInText = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        let isHasLinkInText = false;
        const tgMessage = 'message' in ctx.update ? ctx.update.message : undefined;
        const textTgMessage = tgMessage && 'text' in tgMessage ? tgMessage.text : '';
        const regex = /https?:\/\/\S+/g;
        const withLinkInMessage = regex.test(textTgMessage);
        if (withLinkInMessage) {
            isHasLinkInText = true;
            ctx.replyWithHTML(prohibitedSendingLinks(), {
                parse_mode: 'Markdown',
            });
            ctx.scene.leave();
        }
        return isHasLinkInText;
    } catch (e) {
        console.error('log checkHasLinkInText', e);
        return false;
    }
};
