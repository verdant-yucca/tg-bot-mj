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
        payments?: Array<{ date: string; count: string; price: string }>;
        selectedStyle?: string;
        selectedSize?: string;
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
        selectedStyle?: string;
        selectedSize?: string;
    }

    export interface SaveQueryRequest {
        chatId: string;
        prompt?: string;
        queryId?: string;
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
        queryId: string;
    }

    export interface GetQueryResponse {
        _id: string;
        discordMsgId: string;
        flags: string;
        buttons: string;
        chatId: string;
        prompt: string;
        originPrompt: string;
        midjourneyClientId: string;
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

    export interface WriteOffRequestFromUserResponse extends AuthResponse {
    }

    export interface AddNewTransactionRequest {
        chatId: string;
        prompt?: string;
        originPrompt?: string;
        waitMessageId: string;
        stage: string;
        action?: string;
        discordMsgId?: string;
        midjourneyClientId?: string;
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
        midjourneyClientId: string;
    }

    export interface Packages {
        _id: string;
        name: string;
        price: number;
        dateCreate: Date;
        count: number;
        title: string;
        description: string;
        photoUrl: string;
        photoWidth: number;
        photoHeight: number;
    }

    export interface Settings {
        _id: string;
        styles: Array<{ name: string; value: string; url: string }>;
        sizes: Array<{ name: string; value: string; url: string }>;
    }

    export interface GetAvailableAccountMidjourneyResponse {
        accounts: Accounts[];
    }

    export interface Accounts {
        _id: string;
        name: string;
        customId: string;
        status: string;
        ServerId: string;
        ChannelId: string;
        DiscordToken: string;
        dateCreate: Date;
    }
}
