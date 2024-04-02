import express, { Application } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { join } from 'path';
import { reloadJson } from '../../constants/messages';
import App from './init';
import { restartTelegramBot } from '../TelegramBot/init';

dotenv.config();

App.use(cors());
App.use(json());
App.use(urlencoded({ extended: true }));
App.use('/static', express.static('./src/static'));
App.use(express.static('./src/static'));
App.use('/updateText', (req, res) => {
    delete require.cache[require.resolve('../../data/textMessages.json')];
    reloadJson();
    res.send({ result: true });
});
App.use('/restartTelegramBot', (req, res) => {
    restartTelegramBot();
    res.send({ result: true });
});
App.get('/', (_, res) => res.sendFile(join(__dirname + '/static/index.html')));
const port = process.env.PORT;

App.listen(port, () => console.log(`App listening on port ${port}`));
