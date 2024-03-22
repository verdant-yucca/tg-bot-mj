import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();
const baseUrl = process.env.API_URL || '';

export const getTranslate = async (payload: ApiTypes.GetTranslateRequest): Promise<string> => {
    const { data } = await axios.post(`${baseUrl}/getTranslate`, payload);
    return (data as ApiTypes.GetTranslateRequest).text;
};
