import * as dotenv from 'dotenv';
import { Midjourney } from 'midjourney';

dotenv.config();

const MidjourneyClient = new Midjourney({
    ServerId: '1215917478811795496',
    ChannelId: '1225296420446142535',
    SalaiToken: 'MzM0MzU5OTc3OTkwOTQ2ODE3.GJJf8B.2-gtR7HTf2LWzcdcOmGl-aNbjhHlICmmQTmcD0',
    // Debug: true,
    Ws: true, //enable ws is required for remix mode (and custom zoom)
});
MidjourneyClient.init();

export default MidjourneyClient;
