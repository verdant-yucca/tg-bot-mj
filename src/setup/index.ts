import express, { Application } from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { join } from 'path';
import { reloadJson } from '../constants/messages';
import app from '../index';
import { IConfigService } from '../config/config.interface';
import { ConfigService } from '../config/config.service';
import { prettyLog } from '../utils';

export const setupApp = () => {
    const app: Application = express();
    const config: IConfigService = new ConfigService();

    app.use(cors());
    app.use(json());
    app.use(urlencoded({ extended: true }));
    app.use('/files', express.static('./files'));
    app.use(express.static('./static'));
    app.use('/updateText', (req, res) => {
        delete require.cache[require.resolve('../../data/textMessages.json')];
        reloadJson()
        res.send({ result: true })
    });
    app.get('/', (_, res) => res.sendFile(join(__dirname + '/static/index.html')));
    const port = config.get('PORT');
    console.log('port', port);

    app.listen(port, () => console.log(`App listening on port ${port}`))

    prettyLog({
        message: `Server running at http://localhost::${port}`,
        options: { padding: 1, borderColor: 'green' }
    });
    return app;
};
