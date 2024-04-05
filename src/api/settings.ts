import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();
const baseUrl = process.env.API_URL || '';

export const getSettings = async (): Promise<ApiTypes.Settings> => {
    const { data } = await axios.post(`${baseUrl}/getSettings`, {});
    return data;
};
