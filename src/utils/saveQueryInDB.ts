import { API } from '../api';
import { Scenes } from 'telegraf';
import { ITGData } from '../types';

export const saveQueryInDB = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>, prompt: string) => {
    const { id: chatId } = ctx.from as ITGData;
    const session = ctx.session as { isHasOutstandingRequest: boolean };
    session.isHasOutstandingRequest = true;

    return await API.query.saveQuery({ chatId: chatId.toString(), prompt });
};

export const updateQueryInDB = async ({
                                          _id,
                                          buttons,
                                          discordMsgId,
                                          flags,
                                          action
                                      }: ApiTypes.UpdateQueryRequest, ctx: any) => {
    const session = ctx.session as { isHasOutstandingRequest: boolean };
    session.isHasOutstandingRequest = false;

    return await API.query.updateQuery({ _id, buttons, discordMsgId, flags, action });
};

export const findQueryInDB = async ({ action }: ApiTypes.FindQueryRequest) => {
    return await API.query.findQuery({ action });
};
