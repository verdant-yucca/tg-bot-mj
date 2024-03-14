import { Scenes } from 'telegraf';
import { badRequest, somethingWentWrong } from '../constants/messages';
import { getMainMenu } from '../constants/buttons';

export const sendSomethingWentWrong = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    ctx.reply(somethingWentWrong);
    return ctx.scene.leave();
};

export const sendBadRequestMessage = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    ctx.replyWithHTML(badRequest, { parse_mode: 'Markdown', reply_markup: getMainMenu().reply_markup });
    return ctx.scene.leave();
};

export const sendWaitMessage = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) =>
    //https://i.yapx.ru/XFv9d.gif
    await ctx.replyWithDocument(
        {
            url: 'https://i.yapx.ru/XFv9d.gif',
            filename: 'XFv9d.gif',
        },
        {
            caption: `Ваш запрос добавлен в очередь. Пожалуйста, ожидайте.`,
        },
    );

export const sendLoadingMesage = (
    ctx: Scenes.WizardContext<Scenes.WizardSessionData>,
    message: any,
    progress: string,
) => {
    ctx.telegram.editMessageCaption(
        message.chat.id,
        message.message_id,
        '0',
        `
                      Генерация займёт 0-10 минут. Пожалуйста, ожидайте.
Выполнено: ${progress}
                  `,
    );
};

export const sendDownloadPhotoInProgressMesage = (
    ctx: Scenes.WizardContext<Scenes.WizardSessionData>,
    message: any,
) => {
    ctx.telegram.editMessageCaption(
        message.chat.id,
        message.message_id,
        '0',
        `
                      Генерация займёт 0-10 минут. Пожалуйста, ожидайте.
Выполнено: 100%
Download photo...
                  `,
    );
};
