import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.API_URL || '';

export const tgAuth = async (payload: ApiTypes.AuthDto) => {
  const { data } = await axios.post<ApiTypes.AuthResponse>(`${baseUrl}/signin`, payload);
  return data;
};

