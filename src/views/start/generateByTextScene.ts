import { Markup, Scenes } from 'telegraf';
import { badRequest, notAccessMsg, somethingWentWrong } from '../../constants/messages';
import { client } from '../../setup/bot';
import { getButtonsForFourPhoto } from '../../utils/getButtonsForFourPhoto';
import { getMainMenu } from '../../constants/buttons';

export const enterYourTextStep1 = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
  try {
    if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
      ctx.replyWithHTML(notAccessMsg);
      return ctx.scene.leave();
    }
    ctx.replyWithHTML('Введите свой запрос:');
    ctx.wizard.next();
  } catch (err) {
    console.error('Error msg', err.message);
    console.error('Catch start:', err);
    ctx.reply(somethingWentWrong);
    ctx.scene.leave();
    return;
  }
};
export const generateImageByTextStep2 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
  try {
    //@ts-ignore
    const prompt: string = ctx.update.message.text;

    const regex = /https?:\/\/\S+/g;
    const withLinkInMessage = regex.test(prompt);
    if (withLinkInMessage) {
      ctx.replyWithHTML('Отправка ссылок в запросе запрещена!', {
        parse_mode: 'Markdown',
        reply_markup: getMainMenu().reply_markup
      });
      return ctx.scene.leave();
    }

    //https://i.yapx.ru/XFv9d.gif
    const waitMessage = await ctx.replyWithDocument(
      {
        url: 'https://i.yapx.ru/XFv9d.gif',
        filename: 'XFv9d.gif'
      },
      {
        caption: `Ваш запрос добавлен в очередь. Пожалуйста, ожидайте.`
      }
    );

    //TODO: tut
    client
      .Imagine(prompt, (uri: string, progress: string) => {
        ctx.telegram.editMessageCaption(
          waitMessage.chat.id,
          waitMessage.message_id,
          '0',
          `
                        Генерация займёт 0-10 минут. Пожалуйста, ожидайте.
Выполнено: ${progress}
                    `
        );
      })
      .then(Imagine => {
        if (!Imagine) {
          console.log('no message');
          ctx.scene.leave();
          return;
        }
        ctx.telegram.editMessageCaption(
          waitMessage.chat.id,
          waitMessage.message_id,
          '0',
          `
                        Генерация займёт 0-10 минут. Пожалуйста, ожидайте.
Выполнено: 100%
Download photo...
                    `
        );
        //U1 U2 U3 U4 V1 V2 V3 V4  "Vary (Strong)" ...
        const buttons = getButtonsForFourPhoto(Imagine);
        ctx.replyWithPhoto({ url: Imagine.uri }, Markup.inlineKeyboard(buttons)).then(() => {
          ctx.deleteMessage(waitMessage.message_id);
        });

        //@ts-ignore
        ctx.session.result = Imagine;
        //@ts-ignore
        ctx.session.prompt = prompt;
        //@ts-ignore
        ctx.session.withoutFirstStep = true;
        ctx.scene.leave();
        ctx.scene.enter('generateMoreOrUpscaleScene');
      })
      .catch(e => {
        console.log('eeeeeeeeeeee', e);
        ctx.deleteMessage(waitMessage.message_id);
        ctx.replyWithHTML(badRequest, { parse_mode: 'Markdown', reply_markup: getMainMenu().reply_markup });
      });
  } catch (err) {
    console.error('Error msg', err.message);
    console.error('Catch start:', err);
    ctx.reply(somethingWentWrong);
    ctx.scene.leave();
    return;
  }
};
