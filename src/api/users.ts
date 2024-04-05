import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();
const baseUrl = process.env.API_URL || '';

export const updateUserData = async (payload: ApiTypes.AuthDto): Promise<ApiTypes.AuthResponse> => {
    const { data } = await axios.post(`${baseUrl}/signin`, payload);
    return data;
};

export const writeOffRequestFromUser = async (
    payload: ApiTypes.WriteOffRequestFromUserRequest,
): Promise<ApiTypes.WriteOffRequestFromUserResponse> => {
    const { data } = await axios.post(`${baseUrl}/writeOffRequestFromUser`, payload);
    return data;
};

export const getUserById = async (chatId: string): Promise<ApiTypes.AuthResponse> => {
    const { data } = await axios.post(`${baseUrl}/getUserById`, { chatId });
    return data;
};

export const getUsers = async (): Promise<{ users: ApiTypes.AuthResponse[] }> => {
    const { data } = await axios.post(`${baseUrl}/getUsers`, {});
    return data;
};
