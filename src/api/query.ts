import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();
const baseUrl = process.env.API_URL || '';

export const saveQuery = async (payload: ApiTypes.SaveQueryRequest): Promise<ApiTypes.SaveQueryResponse> => {
    const { data } = await axios.post(`${baseUrl}/saveQuery`, payload);
    return data;
};

export const updateQuery = async (payload: ApiTypes.UpdateQueryRequest): Promise<ApiTypes.UpdateQueryResponse> => {
    const { data } = await axios.post(`${baseUrl}/updateQuery`, payload);
    return data;
};

export const getQuery = async (payload: ApiTypes.GetQueryRequest): Promise<ApiTypes.GetQueryResponse> => {
    const { data } = await axios.post(`${baseUrl}/getQuery`, payload);
    return data;
};

export const findQuery = async (payload: ApiTypes.FindQueryRequest): Promise<ApiTypes.FindQueryResponse> => {
    const { data } = await axios.post(`${baseUrl}/findQuery`, payload);
    return data;
};
