import { API } from '../api';

export const getTranslatePrompt = async (prompt: string) => await API.translate.getTranslate({ text: prompt, targetLanguageCode: 'en' });
