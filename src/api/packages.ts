import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();
const baseUrl = process.env.API_URL || '';

export const getPackages = async (): Promise<{ packages: ApiTypes.Packages[] }> => {
    const { data } = await axios.post(`${baseUrl}/getPackages`, {});
    return data;
};
