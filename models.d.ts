declare namespace ApiTypes {
    export interface AuthDto {
        chatId: string;
        languageCode?: string;
        username?: string;
        firstName: string;
        lastName?: string;
        avatarPath?: string;
    }

    export interface AuthResponse {
        jwt: string;
        user: any;
    }

    export interface SaveQueryRequest {
        chatId: string;
        prompt: string;
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
}
