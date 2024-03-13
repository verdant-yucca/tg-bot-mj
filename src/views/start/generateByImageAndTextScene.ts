import { Markup, Scenes } from 'telegraf';
import { badRequest, notAccessMsg, somethingWentWrong } from '../../constants/messages';
import { client } from '../../setup/bot';
import { getButtonsForFourPhoto } from '../../utils/getButtonsForFourPhoto';
import { ITGData } from '../../types';
import { getMainMenu } from '../../constants/buttons';

export const enterYourImageStep1 = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
  try {
    if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
      ctx.replyWithHTML(notAccessMsg);
      return ctx.scene.leave();
    }
    ctx.replyWithHTML('Отправьте изображение или ссылку на изображение, которое хотите стилизовать:');

    ctx.wizard.next();
  } catch (err) {
    console.error('Error msg', err.message);
    console.error('Catch start:', err);
    ctx.reply(somethingWentWrong);
    ctx.scene.leave();
    return;
  }
};

export const enterYourTextStep2 = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
  try {
    if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
      ctx.replyWithHTML(notAccessMsg);
      return ctx.scene.leave();
    }
    //@ts-ignore
    const photo = ctx.message.photo;

    if (photo.length > 0) {
      const state = ctx.session as { imageUrl?: string };
      const fileId = photo[2].file_id;
      console.log('fileId', fileId);
      ctx.telegram
        .getFileLink(fileId)
        .then(url => {
          state.imageUrl = url.toString();

          if (state.imageUrl) {
            ctx.replyWithHTML('Опишите, как вы хотите изменить изображение:');
            ctx.wizard.next();
          } else {
            ctx.replyWithHTML('Что то пошло не так...');
            return ctx.scene.leave();
          }
        })
        .catch(() => {
          ctx.reply(somethingWentWrong);
        });
    } else {
      ctx.reply(somethingWentWrong);
    }
  } catch (err) {
    console.error('Error msg', err.message);
    console.error('Catch start:', err);
    ctx.reply(somethingWentWrong);
    ctx.scene.leave();
    return;
  }
};
export const stylingImageByTextStep3 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
  try {
    const { imageUrl } = ctx.session as { imageUrl?: string };
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
    //@ts-ignore
    const prompt: string = `${imageUrl} ${ctx.update.message.text}`;
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
      .catch(() => {
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
