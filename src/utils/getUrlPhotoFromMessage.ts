import { Scenes } from 'telegraf';

export const getUrlPhotoFromMessage = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>): Promise<string> => {
    const message = ctx.message;
    const photo = message && 'photo' in message ? message.photo : undefined;
    const url = message && 'text' in message ? message.text : undefined;

    if (url && (url.startsWith('http:') || url.startsWith('https:'))) {
        return url;
    } else if (photo && photo.length > 0) {
        const fileId = photo[2].file_id;
        const url = await ctx.telegram.getFileLink(fileId);
        if (url) return url.toString();
    }

    return '';
};
