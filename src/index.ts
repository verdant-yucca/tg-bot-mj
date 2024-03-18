import * as dotenv from 'dotenv';
import { IConfigService } from './config/config.interface';
import { ConfigService } from './config/config.service';
import { setupApp } from './setup';
import { setupBot } from './setup/bot';
import { prettyLog } from './utils';

dotenv.config();
const app = setupApp();
const config: IConfigService = new ConfigService();

const token = config.get('BOT_TOKEN');
const port = config.get('PORT');

setupBot(token);
console.log('port', port);

app.listen(port, () => console.log(`App listening on port ${port}`))

prettyLog({
    message: `Server running at http://localhost::${port}`,
    options: { padding: 1, borderColor: 'green' }
});

export default app;
