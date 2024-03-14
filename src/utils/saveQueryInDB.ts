import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { API } from '../api';

export const saveQueryInDB = async (chatId: string, prompt: string) => {
  return await API.query.query({ chatId, prompt });
};

export const updateQueryInDB = async (_id: string, buttonsArr: string[], imagineId?: string, flags?: string) => {
  const buttons = JSON.stringify(buttonsArr);
  return await API.query.updateQuery({ _id, buttons, imagineId, flags });
};
