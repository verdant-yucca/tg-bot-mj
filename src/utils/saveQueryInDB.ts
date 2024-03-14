import { API } from '../api';
import { Scenes } from 'telegraf';
import { ITGData } from '../types';

export const saveQueryInDB = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>, prompt: string) => {
    const { id: chatId } = ctx.from as ITGData;

    return await API.query.saveQuery({ chatId: chatId.toString(), prompt });
};

export const updateQueryInDB = async ({ _id, buttons, discordMsgId, flags }: ApiTypes.UpdateQueryRequest) =>
    await API.query.updateQuery({ _id, buttons, discordMsgId, flags });
