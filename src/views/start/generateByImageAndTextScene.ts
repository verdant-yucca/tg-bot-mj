import { Markup, Scenes } from 'telegraf';
import { client } from '../../setup/bot';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../../utils/getButtonsForFourPhoto';
import {
  sendBadRequestMessage,
  sendDownloadPhotoInProgressMesage,
  sendLoadingMesage,
  sendSomethingWentWrong,
  sendWaitMessage
} from '../../utils/sendLoading';
import { saveQueryInDB, updateQueryInDB } from '../../utils';

export const enterYourImageStep1 = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
  try {
    if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return sendSomethingWentWrong(ctx);
    ctx.replyWithHTML('Отправьте изображение или ссылку на изображение, которое хотите стилизовать:');
    ctx.wizard.next();
  } catch (err) {
    console.error('Error msg', err.message);
    return sendSomethingWentWrong(ctx);
  }
};

export const enterYourTextStep2 = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
  try {
    if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return sendSomethingWentWrong(ctx);
    //@ts-ignore
    const photo = ctx.message.photo;

    if (photo.length > 0) {
      const state = ctx.session as { imageUrl?: string };
      const fileId = photo[2].file_id;

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
          return sendSomethingWentWrong(ctx);
        });
    } else {
      return sendSomethingWentWrong(ctx);
    }
  } catch (err) {
    console.error('Error msg', err.message);
    return sendSomethingWentWrong(ctx);
  }
};
export const stylingImageByTextStep3 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
  try {
    const { imageUrl } = ctx.session as { imageUrl?: string };
    const waitMessage = await sendWaitMessage(ctx);
    const prompt: string = `${imageUrl} ${ctx.update.message.text as string}`;
    const { _id } = await saveQueryInDB(ctx, prompt);

    client
      .Imagine(prompt, (uri: string, progress: string) => sendLoadingMesage(ctx, waitMessage, progress))
      .then(Imagine => {
        if (!Imagine) return sendSomethingWentWrong(ctx);
        sendDownloadPhotoInProgressMesage(ctx, waitMessage);

        ctx.replyWithPhoto({ url: Imagine.uri }, Markup.inlineKeyboard(getButtonsForFourPhoto(_id))).then(() => {
          ctx.deleteMessage(waitMessage.message_id);
        });

        const sessionData = ctx.session as { withoutFirstStep: boolean };
        sessionData.withoutFirstStep = true;
        const dataButtons = JSON.stringify(getDataButtonsForFourPhoto(Imagine));
        updateQueryInDB({
          _id,
          buttons: dataButtons,
          discordMsgId: Imagine.id || '',
          flags: Imagine.flags.toString()
        });

        ctx.scene.leave();
        ctx.scene.enter('generateMoreOrUpscaleScene');
      })
      .catch(() => {
        ctx.deleteMessage(waitMessage.message_id);
        return sendBadRequestMessage(ctx);
      });
  } catch (err) {
    console.error('Error msg', err.message);
    return sendSomethingWentWrong(ctx);
  }
};
