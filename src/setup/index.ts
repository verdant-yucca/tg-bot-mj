import express, { Application } from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { join } from 'path';
import { reloadJson } from '../constants/messages';

export const setupApp = () => {
    const app: Application = express();
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
    return app;
};
