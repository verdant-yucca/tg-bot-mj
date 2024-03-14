import axios from 'axios';

const baseUrl = process.env.API_URL || '';

export const tgAuth = async (payload: ApiTypes.AuthDto): Promise<ApiTypes.AuthResponse> => {
    const { data } = await axios.post(`${baseUrl}/signin`, payload);
    return data;
};
