import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { Markup } from 'telegraf';

export const getButtonsForFourPhoto = (response: any) => {
    const buttons = [[], [], []] as InlineKeyboardMarkup['inline_keyboard'];
    response.options?.map((option) => {
        const label = option.label;
        const data = option.custom;
        const firstRow = ['U1', 'U2', 'U3', 'U4'];
        const secondRow = ['V1', 'V2', 'V3', 'V4'];
        const currentRow = firstRow.includes(label) ? 0 : secondRow.includes(label) ? 1 : 2;
        buttons[currentRow].push(Markup.button.callback(label, data));
    });
    return buttons;
};
