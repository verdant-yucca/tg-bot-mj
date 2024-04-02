import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();
const baseUrl = process.env.API_URL || '';

export const addNewTransaction = async (
    payload: ApiTypes.AddNewTransactionRequest,
): Promise<ApiTypes.AddNewTransactionResponse> => {
    const { data } = await axios.post(`${baseUrl}/addNewTransaction`, payload);
    return data;
};

export const updateTransaction = async (
    payload: ApiTypes.UpdateTransactionRequest,
): Promise<ApiTypes.UpdateTransactionResponse> => {
    const { data } = await axios.post(`${baseUrl}/updateTransaction`, payload);
    return data;
};

export const getTransactions = async (): Promise<ApiTypes.GetTransactionsResponse> => {
    const { data } = await axios.post(`${baseUrl}/getTransactions`, {});
    return data;
};

export const deleteTransaction = async (_id: string): Promise<any> => {
    const { data } = await axios.post(`${baseUrl}/deleteTransaction`, { _id });
    return data;
};
