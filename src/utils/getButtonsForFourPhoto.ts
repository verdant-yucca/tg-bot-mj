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
    const buttons = response.options?.reduce((acc, option) => {
        acc[option.label] = option.custom;
        return acc;
    }, {} as { [key: string]: string }) || {};

    return {
        U1: buttons['U1'],
        U2: buttons['U2'],
        U3: buttons['U3'],
        U4: buttons['U4'],
        V1: buttons['V1'],
        V2: buttons['V2'],
        V3: buttons['V3'],
        V4: buttons['V4'],
        '🔄': buttons['🔄']
    };
};
