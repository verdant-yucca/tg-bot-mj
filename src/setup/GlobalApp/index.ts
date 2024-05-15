import express, { Application } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { exec } from 'child_process';
import { json, urlencoded } from 'body-parser';
import { join } from 'path';
import { reloadJson as reloadJsonContent } from '../../constants/messages';
import { API } from '../../api';
import App from './init';
import TelegramBot, { restartTelegramBot } from '../TelegramBot/init';
import { reloadJson as reloadJsonBunnedWords } from '../../constants/bannedWords';
import { reloadJson as reloadJsonWordsForDelete } from '../../constants/wordsfordelete';

dotenv.config();

App.use(cors());
App.use(json());
App.use(urlencoded({ extended: true }));
App.use('/static', express.static('./src/static'));
App.use(express.static('./src/static'));
App.use('/updateText', (req, res) => {
    reloadJsonContent();
    res.send({ result: true });
});

App.use('/updateBannedWords', (req, res) => {
    reloadJsonBunnedWords();
    res.send({ result: true });
});

App.use('/updateWordsForDelete', (req, res) => {
    reloadJsonWordsForDelete();
    res.send({ result: true });
});

App.use('/restartTelegramBot', (req, res) => {
    try {
        exec('pm2 restart 0', (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка при выполнении команды: ${error.message}`);
                return res.status(500).send(`Ошибка при выполнении команды: ${error.message}`);
            }
            if (stderr) {
                console.error(`Ошибка в процессе выполнения: ${stderr}`);
                return res.status(500).send(`Ошибка в процессе выполнения: ${stderr}`);
            }
            console.log(`Результат: ${stdout}`);
            res.send(`Команда выполнена успешно: ${stdout}`);
        });
        // restartTelegramBot();
        res.send({ result: true });
    } catch (e) {
        // @ts-ignore
        console.log(`/restartTelegramBot error: ${e?.message || e}`);
    }
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
