import { Scenes } from 'telegraf';

export interface ITGData {
    id: number;
    language_code?: string;
    username?: string;
    first_name: string;
    last_name?: string;
}

export interface IStateData {
    user: ApiTypes.UserResponse;
    jwt?: string;
    lastMsgId?: number;
}

export interface IBackToStepData {
    ctx: Scenes.WizardContext<Scenes.WizardSessionData>;
    indexStep: number;
    value: string | number;
    handle: (ctx: Scenes.WizardContext<Scenes.WizardSessionData>, value: string | number) => Promise<any>;
}

export interface ReplyMarkup {
    reply_markup: {
        inline_keyboard: { text: string; callback_data: string }[][];
        resize_keyboard?: boolean;
    };
}

export type Command = { text: string; callback_data: string };
export type Commands = Command[][];
