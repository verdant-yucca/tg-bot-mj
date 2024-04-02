import * as dotenv from 'dotenv';
import { Midjourney } from 'midjourney';

dotenv.config();

const MidjourneyClient = new Midjourney({
    ServerId: process.env.SERVER_ID,
    ChannelId: process.env.CHANNEL_ID,
    SalaiToken: process.env.SALAI_TOKEN || '',
    // Debug: true,
    Ws: true, //enable ws is required for remix mode (and custom zoom)
});
MidjourneyClient.init();

export default MidjourneyClient;
