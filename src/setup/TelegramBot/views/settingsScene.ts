import { Markup, Scenes } from 'telegraf';
import { sendSomethingWentWrong } from '../../../utils/sendLoading';
import { checkIsGroupMember } from '../../../utils/checks/checkIsGroupMember';
import {
    countFreeRequest,
    hidePayments,
    package1,
    package2,
    package3,
    package4,
    paymentsMenuMessage,
    settingsMenuMessage,
    sizesMenuMessage,
    stylesMenuMessage,
} from '../../../constants/messages';
import { ITGData } from '../../../types';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import TelegramBot from '../init';
import { commands } from '../../../constants/bot';
import { getUserByIdFromDb, updateUserInDb } from '../../../utils/db/saveUserInDb';
import { getSettings } from '../../../utils/db/settings';

export const getSettingsButtons = (): InlineKeyboardMarkup['inline_keyboard'] => {
    const firstRow = [Markup.button.callback('Выбрать стиль', `Выбрать стиль`)];

    const secondRow = [Markup.button.callback('Выбрать размер', `Выбрать размер`)];

    const thirdRow = [Markup.button.callback('Купить запросы', `Купить запросы`)];
    if (hidePayments()) {
        return [firstRow, secondRow];
    } else {
        return [firstRow, secondRow, thirdRow];
    }
};

export const getPaymentsButtons = (): InlineKeyboardMarkup['inline_keyboard'] => {
    const firstRow = [Markup.button.callback(package1(), package1())];
    const secondRow = [Markup.button.callback(package2(), package2())];
    const thirdRow = [Markup.button.callback(package3(), package3())];
    const fourthRow = [Markup.button.callback(package4(), package4())];
    const fifthRow = [Markup.button.callback('🔙 Вернуться в настройки', commands.settings.command)];

    return [firstRow, secondRow, thirdRow, fourthRow, fifthRow];
};

export const getStylesButtons = (
    styles: Array<{ name: string; value: string; url: string }>,
    currentStyle: string
): InlineKeyboardMarkup['inline_keyboard'] => {
    const backRow = [Markup.button.callback('🔙 Вернуться в настройки', commands.settings.command)];
    const sizesButtons = styles.map(({ name, value }) => [
        Markup.button.callback(
            currentStyle === value ? `✔ ${name}` : !currentStyle ? (name === 'Без стиля' ? `✔ ${name}` : name) : name,
            `setStyles!!!${value}`
        ),
    ]);

    return [...sizesButtons, backRow];
};

export const getSizesButtons = (
    sizes: Array<{ name: string; value: string; url: string }>,
    currentSize: string
): InlineKeyboardMarkup['inline_keyboard'] => {
    const backRow = [Markup.button.callback('🔙 Вернуться в настройки', commands.settings.command)];
    const sizesButtons = sizes.map(({ name, value }) => [
        Markup.button.callback(
            currentSize === value ? `✔ ${name}` : !currentSize ? (name === 'Без формата' ? `✔ ${name}` : name) : name,
            `setSizes!!!${value}`
        ),
    ]);

    return [...sizesButtons, backRow];
};

export const sendSettingsStep1 = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) {
            const chatId = (ctx.from as ITGData).id.toString();
            sendSomethingWentWrong(chatId);
            return ctx.scene.leave();
        }
        if (!(await checkIsGroupMember(ctx))) return;

        const { countQueries, countFreeQueries, selectedStyle, selectedSize } = await getUserByIdFromDb(ctx);
        let currentSelectedStyle;
        let currentSelectedSize;

        if (selectedStyle || selectedSize) {
            const { styles, sizes } = await getSettings();
            if (selectedStyle && styles)
                currentSelectedStyle = styles.find(({ value }) => value === selectedStyle)?.name;
            if (selectedSize && sizes) currentSelectedSize = sizes.find(({ value }) => value === selectedSize)?.name;
        }

        ctx.replyWithHTML(
            settingsMenuMessage({
                countFreeQueries: countFreeQueries || '0',
                countFreeRequestBonus: countFreeRequest() || '0',
                countQueries: countQueries || '0',
                size: currentSelectedSize || 'Без формата',
                style: currentSelectedStyle || 'Без стиля',
            }),
            {
                parse_mode: 'Markdown',
                reply_markup: Markup.inlineKeyboard(getSettingsButtons()).reply_markup,
            }
        );
        ctx.wizard.next();
    } catch (e) {
        console.error('generateByText -> enterYourTextStep1 -> catch', e);
        const chatId = (ctx.from as ITGData).id.toString();
        sendSomethingWentWrong(chatId);
        return ctx.scene.leave();
    }
};

export const sendPaymentsMenu = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const chatId = (ctx.from as ITGData).id.toString();
        const originMessageId =
            'callback_query' in ctx.update ? ctx.update.callback_query.message?.message_id : undefined;
        originMessageId &&
            TelegramBot.telegram
                .editMessageText(chatId, originMessageId, '0', paymentsMenuMessage(), {
                    parse_mode: 'Markdown',
                    reply_markup: Markup.inlineKeyboard(getPaymentsButtons()).reply_markup,
                })
                .catch(e => console.error('sendDownloadPhotoInProgressMesage e ', e));
    } catch (e) {
        console.error('sendPaymentsMenu -> catch ', e);
    }
};

export const sendStylesMenu = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const chatId = (ctx.from as ITGData).id.toString();
        const originMessageId =
            'callback_query' in ctx.update ? ctx.update.callback_query.message?.message_id : undefined;
        const { styles } = await getSettings();
        const { selectedStyle } = await getUserByIdFromDb(ctx);
        originMessageId &&
            TelegramBot.telegram
                .editMessageText(chatId, originMessageId, '0', stylesMenuMessage(), {
                    parse_mode: 'Markdown',
                    reply_markup: Markup.inlineKeyboard(getStylesButtons(styles, selectedStyle || 'Не выбрано'))
                        .reply_markup,
                })
                .catch(e => console.error('sendStylesMenu e ', e));
    } catch (e) {
        console.error('sendPaymentsMenu -> catch ', e);
    }
};

export const updateStylesMenu = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const chatId = (ctx.from as ITGData).id.toString();
        const callback = ctx.update && 'callback_query' in ctx.update ? ctx.update.callback_query : undefined;
        const callbackData = callback && 'data' in callback ? callback.data : '';
        const originMessageId = callback?.message?.message_id;
        const selectedStyle = callbackData.split('!!!')[1] || 'Без стиля';
        const { styles } = await getSettings();
        updateUserInDb(ctx, { selectedStyle }).catch(e => console.error(e));
        originMessageId &&
            TelegramBot.telegram
                .editMessageText(chatId, originMessageId, '0', stylesMenuMessage(), {
                    parse_mode: 'Markdown',
                    reply_markup: Markup.inlineKeyboard(getStylesButtons(styles, selectedStyle || 'Не выбрано'))
                        .reply_markup,
                })
                .catch(e => console.error('sendStylesMenu e ', e));
    } catch (e) {
        console.error('sendPaymentsMenu -> catch ', e);
    }
};

export const sendSizesMenu = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const chatId = (ctx.from as ITGData).id.toString();
        const originMessageId =
            'callback_query' in ctx.update ? ctx.update.callback_query.message?.message_id : undefined;
        const { sizes } = await getSettings();
        const { selectedSize } = await getUserByIdFromDb(ctx);
        if (originMessageId) {
            TelegramBot.telegram
                .editMessageText(chatId, originMessageId, '0', sizesMenuMessage(), {
                    parse_mode: 'Markdown',
                    reply_markup: Markup.inlineKeyboard(getSizesButtons(sizes, selectedSize || 'Не выбрано'))
                        .reply_markup,
                })
                .catch(e => console.error('sendSizesMenu e ', e));
        }
    } catch (e) {
        console.error('sendPaymentsMenu -> catch ', e);
    }
};

export const updateSizesMenu = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const chatId = (ctx.from as ITGData).id.toString();
        const callback = ctx.update && 'callback_query' in ctx.update ? ctx.update.callback_query : undefined;
        const callbackData = callback && 'data' in callback ? callback.data : '';
        const originMessageId = callback?.message?.message_id;
        const selectedSize = callbackData.split('!!!')[1] || 'Без стиля';
        const { sizes } = await getSettings();
        updateUserInDb(ctx, { selectedSize }).catch(e => console.error(e));

        if (originMessageId) {
            TelegramBot.telegram
                .editMessageText(chatId, originMessageId, '0', sizesMenuMessage(), {
                    parse_mode: 'Markdown',
                    reply_markup: Markup.inlineKeyboard(getSizesButtons(sizes, selectedSize || 'Не выбрано'))
                        .reply_markup,
                })
                .catch(e => console.error('sendSizesMenu e ', e));
        }
    } catch (e) {
        console.error('sendPaymentsMenu -> catch ', e);
    }
};

export const backToSettingsMenu = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    try {
        const chatId = (ctx.from as ITGData).id.toString();
        const originMessageId =
            'callback_query' in ctx.update ? ctx.update.callback_query.message?.message_id : undefined;

        const { countQueries, countFreeQueries, selectedStyle, selectedSize } = await getUserByIdFromDb(ctx);
        let currentSelectedStyle;
        let currentSelectedSize;

        if (selectedStyle || selectedSize) {
            const { styles, sizes } = await getSettings();
            if (selectedStyle && styles)
                currentSelectedStyle = styles.find(({ value }) => value === selectedStyle)?.name;
            if (selectedSize && sizes) currentSelectedSize = sizes.find(({ value }) => value === selectedSize)?.name;
        }

        TelegramBot.telegram
            .editMessageText(
                chatId,
                originMessageId,
                '0',
                settingsMenuMessage({
                    countFreeQueries: countFreeQueries || '0',
                    countFreeRequestBonus: countFreeRequest() || '0',
                    countQueries: countQueries || '0',
                    size: currentSelectedSize || 'Без формата',
                    style: currentSelectedStyle || 'Без стиля',
                }),
                {
                    parse_mode: 'Markdown',
                    reply_markup: Markup.inlineKeyboard(getSettingsButtons()).reply_markup,
                }
            )
            .catch(e => console.error('sendDownloadPhotoInProgressMesage e ', e));
    } catch (e) {
        console.error('sendPaymentsMenu -> catch ', e);
    }
};
