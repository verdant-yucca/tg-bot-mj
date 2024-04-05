import { Midjourney } from 'midjourney';
import MidjourneyClient1 from './client1';
import MidjourneyClient2 from './client2';
import MidjourneyClient3 from './client3';

export const MidjourneyClient: Record<string, Midjourney> = {
    '1': MidjourneyClient1,
    '2': MidjourneyClient2,
    '3': MidjourneyClient3,
};
