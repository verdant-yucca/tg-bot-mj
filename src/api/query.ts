import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.API_URL || '';

export const query = async (payload: ApiTypes.Query) => {
  const { data } = await axios.post<ApiTypes.QueryResponse>(`${baseUrl}/queries`, payload);
  return data;
};
