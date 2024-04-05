import * as dotenv from 'dotenv';
import { Midjourney } from 'midjourney';

dotenv.config();

const MidjourneyClient = new Midjourney({
    ServerId: '1215917478811795496',
    ChannelId: '1215917479436750859',
    SalaiToken: 'MTIxNTE5NjAzNjc0Njk3MzIyNA.GMtmLW.turiajtUENs0RnfRNyVkJKnD2C6jcav0HgMmCs',
    // Debug: true,
    Ws: true, //enable ws is required for remix mode (and custom zoom)
});
MidjourneyClient.init();

export default MidjourneyClient;
