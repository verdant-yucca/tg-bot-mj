import { Midjourney } from 'midjourney';
import { getAvailableAccountMidjourney } from '../../utils/db/availableAccountMidjourney';

const getMidjourneyClients = async () => {
    const result: Record<string, Midjourney> = {};
    const { accounts } = await getAvailableAccountMidjourney();
    accounts.forEach(({ ChannelId, customId, DiscordToken, ServerId, status }) => {
        if (status === 'ready') {
            result[customId] = new Midjourney({
                ServerId,
                ChannelId,
                SalaiToken: DiscordToken,
                // Debug: true,
                Ws: true //enable ws is required for remix mode (and custom zoom)
            });
        }
    });
    return result;
};

export let MidjourneyClient: Record<string, Midjourney> = {};
getMidjourneyClients().then((result) => {
    MidjourneyClient = result;
});
