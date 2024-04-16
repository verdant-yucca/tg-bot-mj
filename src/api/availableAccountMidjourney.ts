import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();
const baseUrl = process.env.API_URL || '';

export const getAvailableAccountMidjourney = async (): Promise<ApiTypes.GetAvailableAccountMidjourneyResponse> => {
    const { data } = await axios.post(`${baseUrl}/getAvailableAccountMidjourney`, {});
    return data;
};