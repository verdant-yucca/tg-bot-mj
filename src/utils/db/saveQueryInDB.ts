import { API } from '../../api';

export const saveQueryInDB = async (payloda: ApiTypes.SaveQueryRequest) => {
    try {
        return await API.query.saveQuery(payloda);
    } catch (e) {
        console.error('не удалось сохранить запрос в бд');
        return { _id: '' };
    }
};

export const updateQueryInDB = async (
    { _id, buttons, discordMsgId, flags, action }: ApiTypes.UpdateQueryRequest,
    ctx: any,
) => {
    try {
        const session = ctx.session as { isHasOutstandingRequest: boolean };
        session.isHasOutstandingRequest = false;

        return await API.query.updateQuery({ _id, buttons, discordMsgId, flags, action });
    } catch (e) {
        console.error('не удалось обновить запись в бд', e);
    }
};

export const findQueryInDB = async ({ action }: ApiTypes.FindQueryRequest) => await API.query.findQuery({ action });
