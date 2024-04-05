import express, { Application } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { join } from 'path';
import { reloadJson as reloadJsonContent } from '../../constants/messages';
import { API } from '../../api';
import App from './init';
import TelegramBot, { restartTelegramBot } from '../TelegramBot/init';
import { reloadJson as reloadJsonBunnedWords } from '../../constants/bannedWords';

dotenv.config();

App.use(cors());
App.use(json());
App.use(urlencoded({ extended: true }));
App.use('/static', express.static('./src/static'));
App.use(express.static('./src/static'));
App.use('/updateText', (req, res) => {
    delete require.cache[require.resolve('../../data/textMessages.json')];
    reloadJsonContent();
    res.send({ result: true });
});

App.use('/updateBannedWords', (req, res) => {
    delete require.cache[require.resolve('../../data/bannedWords.json')];
    reloadJsonBunnedWords();
    res.send({ result: true });
});

App.use('/restartTelegramBot', (req, res) => {
    restartTelegramBot();
    res.send({ result: true });
});

App.use('/massMailing', async (req, res) => {
    try {
        const { message } = req.body;
        console.log(message);
        if (message) {
            const { users } = await API.users.getUsers();
            console.log(users);
            users.forEach(({ chatId }) => TelegramBot.telegram.sendMessage(chatId, message));
            res.send({ result: 'успешно!' });
        }
    } catch (e) {
        console.error('massMailing -> catch');
    }
});

App.get('/', (_, res) => res.sendFile(join(__dirname + '/static/index.html')));
const port = process.env.PORT;

App.listen(port, () => console.log(`App listening on port ${port}`));
