export interface ITGData {
    id: number;
    language_code?: string;
    username?: string;
    first_name: string;
    last_name?: string;
}

export interface IStateData {
    user: any;
    jwt?: string;
    lastMsgId?: number;
}

export interface ReplyMarkup {
    reply_markup: {
        inline_keyboard: Array<Array<{ text: string; callback_data: string }>>;
        resize_keyboard?: boolean;
    };
}

export type Command = { text: string; callback_data: string };
export type Commands = Command[][];
