import { IConfigService } from './config/config.interface';
import { ConfigService } from './config/config.service';
import { setupApp } from './setup';
import { setupBot } from './setup/bot';

const app = setupApp();
const config: IConfigService = new ConfigService();

const token = config.get('BOT_TOKEN');
setupBot(token);

export default app;
