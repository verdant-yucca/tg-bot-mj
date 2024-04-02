declare namespace ApiTypes {
    export interface AuthDto {
        chatId: string;
        languageCode?: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        avatarPath?: string;
        countQueries?: string;
        countFreeQueries?: string;
        lastAuth?: string;
        left?: boolean;
    }

    export interface AuthResponse {
        _id: string;
        chatId: string;
        languageCode?: any;
        username?: string;
        firstName: string;
        lastName?: string;
        avatarPath?: string;
        countQueries?: string;
        countFreeQueries?: string;
        lastAuth?: string;
        left?: boolean;
    }

    export interface SaveQueryRequest {
        chatId: string;
        prompt?: string;
        originPrompt?: string;
        waitMessageId?: string;
        discordMsgId?: string;
        action?: string;
        flags?: string;
        buttons?: string;
        stage?: string;
        dateQuery?: Date;
        dateUpdate?: Date;
        leadTime?: number;
        waitTime?: number;
    }

    export interface SaveQueryResponse {
        _id: string;
    }

    export interface UpdateQueryRequest {
        _id: string;
        discordMsgId: string;
        action: string;
        flags: string;
        buttons: string;
    }

    export interface UpdateQueryResponse {
        _id: string;
    }

    export interface GetQueryRequest {
        _id: string;
    }

    export interface GetQueryResponse {
        _id: string;
        discordMsgId: string;
        flags: string;
        buttons: string;
        chatId: string;
        prompt: string;
        originPrompt: string;
    }

    export interface FindQueryRequest {
        action: string;
    }

    export interface FindQueryResponse {
        result: boolean;
    }

    export interface GetTranslateRequest {
        text: string;
        targetLanguageCode: string;
    }

    export interface GetTranslateResponse {
        text: string;
    }

    export interface WriteOffRequestFromUserRequest {
        chatId: string;
    }

    export interface WriteOffRequestFromUserResponse extends AuthResponse {}

    export interface AddNewTransactionRequest {
        chatId: string;
        prompt?: string;
        originPrompt?: string;
        waitMessageId: string;
        stage: string;
        action?: string;
        discordMsgId?: string;
    }

    export interface AddNewTransactionResponse {
        _id: string;
    }

    export interface UpdateTransactionRequest {
        _id: string;
        discordMsgId?: string;
        action?: string;
        prompt?: string;
        originPrompt?: string;
        flags?: string;
        buttons?: string;
        stage: string;
    }

    export interface UpdateTransactionResponse {
        _id: string;
    }

    export interface GetTransactionsResponse {
        transactions: Transaction[];
    }
    export interface Transaction {
        _id: string;
        chatId: string;
        prompt: string;
        originPrompt: string;
        waitMessageId: string;
        discordMsgId: string;
        action: string;
        flags: string;
        buttons: string;
        stage: string;
        dateQuery: Date;
        dateUpdate: Date;
        leadTime: number;
        waitTime: number;
    }
}
