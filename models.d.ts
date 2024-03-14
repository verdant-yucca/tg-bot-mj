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

  export interface Query {
    chatId: string;
    prompt: string;
  }

  export interface QueryResponse {
    chatId: string;
    prompt: string;
    _id: string;
    dateQuery: string;
    __v: number;
  }

  export interface UpdateQueryResponse {
    _id: string;
    imagineId?: string;
    flags?: string;
    buttons: string;
  }
}
