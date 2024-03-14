import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { Markup } from 'telegraf';
import { MJMessage } from 'midjourney';

export const getButtonsForFourPhoto = (id: string): InlineKeyboardMarkup['inline_keyboard'] => {
    const firstRow = [
        Markup.button.callback('U1', `${id}!!!U1`),
        Markup.button.callback('U2', `${id}!!!U2`),
        Markup.button.callback('U3', `${id}!!!U3`),
        Markup.button.callback('U4', `${id}!!!U4`)
    ];

    const secondRow = [
        Markup.button.callback('V1', `${id}!!!V1`),
        Markup.button.callback('V2', `${id}!!!V2`),
        Markup.button.callback('V3', `${id}!!!V3`),
        Markup.button.callback('V4', `${id}!!!V4`)
    ];
    const thirdRow = [Markup.button.callback('🔄', `${id}!!!🔄`)];

    return [firstRow, secondRow, thirdRow];
};

export const getDataButtonsForFourPhoto = (response: MJMessage) => {
    const arrButton = response.options?.map((option) => ({ [option.label]: option.custom }));

    return {
        'U1': arrButton['U1'],
        'U2': arrButton['U2'],
        'U3': arrButton['U3'],
        'U4': arrButton['U4'],
        'V1': arrButton['V1'],
        'V2': arrButton['V2'],
        'V3': arrButton['V3'],
        'V4': arrButton['V4'],
        '🔄': arrButton['🔄']
    };
};
