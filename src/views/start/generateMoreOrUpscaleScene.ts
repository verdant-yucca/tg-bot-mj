import { Markup, Scenes } from 'telegraf';
import { client } from '../../setup/bot';
import { getButtonsForFourPhoto, getDataButtonsForFourPhoto } from '../../utils/getButtonsForFourPhoto';
import {
  sendDownloadPhotoInProgressMesage,
  sendLoadingMesage,
  sendSomethingWentWrong,
  sendWaitMessage
} from '../../utils/sendLoading';
import { saveQueryInDB, updateQueryInDB } from '../../utils';
import { getQuery } from '../../api/query';

export const generateMoreOrUpscaleAwaitStep = (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
  try {
    if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return sendSomethingWentWrong(ctx);

    ctx.wizard.next();
  } catch (err) {
    console.error('Error msg', err.message);
    return sendSomethingWentWrong(ctx);
  }
};

export const generateMoreOrUpscaleStep = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
  try {
    const callback = ctx.update?.callback_query as { data: string };
    const queryId = callback.data.split('!!!')[0];
    const button = callback.data.split('!!!')[1];
    const { buttons, discordMsgId, prompt, flags, chatId } = await getQuery({ _id: queryId });
    const allCustomButtons = JSON.parse(buttons) as Record<string, string>;
    const custom = allCustomButtons[button];
    const waitMessage = await sendWaitMessage(ctx);

    const { _id } = await saveQueryInDB(ctx, prompt);

    if (custom.includes('upsample')) {
      client
        .Custom({
          msgId: discordMsgId,
          flags: +flags,
          customId: custom,
          loading: (uri: string, progress: string) => {
            ctx.telegram.editMessageCaption(waitMessage.chat.id, waitMessage.message_id, '0', `Download photo...`);
          }
        })
        .then(async Upscale => {
          if (!Upscale) return sendSomethingWentWrong(ctx);

          ctx.telegram.editMessageCaption(waitMessage.chat.id, waitMessage.message_id, '0', `Download photo...`);
          ctx
            .replyWithPhoto(
              { url: Upscale.uri },
              {
                caption: `Изображение по запросу:
${prompt}`
              }
            )
            .then(resultMessage => {
              ctx.deleteMessage(waitMessage.message_id);
              const chatId = process.env.GROUP_ID as string;
              ctx.telegram.forwardMessage(chatId, resultMessage.chat.id, resultMessage.message_id);
            });

          updateQueryInDB({
            _id,
            buttons: '',
            discordMsgId: Upscale.id || '',
            flags: Upscale.flags.toString()
          });
          ctx.scene.leave();
        });
    } else if (custom.includes('variation')) {
      client
        .Custom({
          msgId: discordMsgId,
          flags: +flags,
          customId: custom,
          content: prompt, //remix mode require content
          loading: (uri: string, progress: string) => sendLoadingMesage(ctx, waitMessage, progress)
        })
        .then(Variation => {
          if (!Variation) return sendSomethingWentWrong(ctx);
          sendDownloadPhotoInProgressMesage(ctx, waitMessage);

          ctx.replyWithPhoto({ url: Variation.uri }, Markup.inlineKeyboard(getButtonsForFourPhoto(_id))).then(() => {
            ctx.deleteMessage(waitMessage.message_id);
          });

          const dataButtons = JSON.stringify(getDataButtonsForFourPhoto(Variation));
          updateQueryInDB({
            _id,
            buttons: dataButtons,
            discordMsgId: Variation.id || '',
            flags: Variation.flags.toString()
          });

          ctx.scene.leave();
          ctx.scene.enter('generateMoreOrUpscaleScene');
        });
    } else if (custom.includes('reroll')) {
      client
        .Imagine(prompt, (uri: string, progress: string) => sendLoadingMesage(ctx, waitMessage, progress))
        .then(Imagine => {
          if (!Imagine) return sendSomethingWentWrong(ctx);
          sendDownloadPhotoInProgressMesage(ctx, waitMessage);

          ctx.replyWithPhoto({ url: Imagine.uri }, Markup.inlineKeyboard(getButtonsForFourPhoto(_id))).then(() => {
            ctx.deleteMessage(waitMessage.message_id);
          });

          const dataButtons = JSON.stringify(getDataButtonsForFourPhoto(Imagine));
          updateQueryInDB({
            _id,
            buttons: dataButtons,
            discordMsgId: Imagine.id || '',
            flags: Imagine.flags.toString()
          });

          ctx.scene.leave();
          ctx.scene.enter('generateMoreOrUpscaleScene');
        });
    }
  } catch (err) {
    console.error('Error msg', err.message);
    return sendSomethingWentWrong(ctx);
  }
};
