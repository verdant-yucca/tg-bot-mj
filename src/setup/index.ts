import express, { Application } from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { join } from 'path';

export const setupApp = () => {
  const app: Application = express();
  app.use(cors());
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use('/files', express.static('./files'));
  app.use(express.static('./static'));
  app.get('/', (_, res) => res.sendFile(join(__dirname + '/static/index.html')));
  return app;
};
