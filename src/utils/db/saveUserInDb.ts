import { API } from '../../api';
import { Scenes } from 'telegraf';
import { ITGData } from '../../types';

export const updateUserInDb = async (
    ctx: Scenes.WizardContext<Scenes.WizardSessionData>,
    dataForUpdate: ApiTypes.AuthDto,
) => {
    const { id: chatId } = ctx.from as ITGData;

    return await API.users.updateUserData({ ...dataForUpdate, chatId: chatId.toString() });
};

export const writeOffRequestFromUser = async (chatId: string) => {
    try {
        return await API.users.writeOffRequestFromUser({ chatId });
    } catch (e) {
        console.error('writeOffRequestFromUser e ', e);
        return undefined;
    }
};

export const getUserByIdFromDb = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>) => {
    const { id: chatId } = ctx.from as ITGData;
    return await API.users.getUserById(chatId.toString());
};
