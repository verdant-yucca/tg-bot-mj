import { Scenes } from 'telegraf';

export const getUrlPhotoFromMessage = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>): Promise<string | undefined> => {
    const message = ctx.message;
    const photo = message && 'photo' in message ? message.photo : undefined;
    const url = message && 'text' in message ? message.text : '';

    const regex = /https?:\/\/\S+/g;
    const withLinkInMessage = regex.test(url);
    if (url && withLinkInMessage) {
        return url;
    } else if (photo && photo.length > 0) {
        const fileId = photo[2].file_id;
        const url = await ctx.telegram.getFileLink(fileId);
        if (url) return url.toString();
    }

    return undefined;
};
