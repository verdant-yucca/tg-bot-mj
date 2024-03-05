import http from 'http';

import { IConfigService } from './src/config/config.interface';
import { ConfigService } from './src/config/config.service';
import app from './src';
import { prettyLog } from './src/utils/prettyLog.util';

const config: IConfigService = new ConfigService();
const port = config.get('PORT');

http.createServer({}, app).listen(port);

prettyLog({
  message: `Server running at http://localhost::${port}`,
  options: { padding: 1, borderColor: 'green' }
});
