import { Scenes } from 'telegraf';
import { API } from '../api';

export const getTranslate = async (prompt: string) =>
    await API.translate.getTranslate({ text: prompt, targetLanguageCode: 'en' });

export const getTranslatedPrompt = async (
    ctx: Scenes.WizardContext<Scenes.WizardSessionData>,
): Promise<{ originPrompt: string; translatedPrompt: string }> => {
    const tgMessage = 'message' in ctx.update ? ctx.update.message : undefined;
    const textTgMessage = tgMessage && 'text' in tgMessage ? tgMessage.text : '';
    let translatedTgMessage = textTgMessage;
    console.log('запрос: ', translatedTgMessage);
    try {
        if (textTgMessage) {
            translatedTgMessage = await getTranslate(textTgMessage);
        }
        return { originPrompt: textTgMessage, translatedPrompt: translatedTgMessage };
    } catch (e) {
        console.error('log checkHasLinkInText', e);
        return { originPrompt: textTgMessage, translatedPrompt: translatedTgMessage || '' };
    }
};
