import { API } from '../api';

export const saveQueryInDB = (chatId: string, prompt: string) => {
  API.query.query({ chatId, prompt });
};
