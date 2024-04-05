import * as dotenv from 'dotenv';
import { Midjourney } from 'midjourney';

dotenv.config();

const MidjourneyClient = new Midjourney({
    ServerId: '1215917478811795496',
    ChannelId: '1225296968469708900',
    SalaiToken: 'MjkwNDk3NjM0NDI1MTEwNTI4.GQMx6b.ZLeqB3-MrrSY4eUK_QOaOUA7gCeDGSSK5TKAGk',
    // Debug: true,
    Ws: true, //enable ws is required for remix mode (and custom zoom)
});
MidjourneyClient.init();

export default MidjourneyClient;
