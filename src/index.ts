import './LoadEnv';
import app from '@server';
import logger from '@shared/Logger';
import http from 'http';
import { initSocketIO } from './Socket';
import { Sequelize } from 'sequelize';
import { initUserModel } from './models/User';
import { initFriendModel } from './models/Friend';
import fs from 'fs';
import path from 'path';
import { initMessageModel } from './models/Message';

const configContents = JSON.parse(fs.readFileSync(path.join(__dirname, '..\\database\\config\\config.json'), { encoding: 'utf8' }));

const databaseName = configContents.development.database;
const username = configContents.development.username;
const password: string = configContents.development.password;

const port = Number(process.env.PORT || 3000);

const httpServer = http.createServer(app);

const sequelize = new Sequelize(databaseName, username, password, {
  host: 'localhost',
  dialect: 'mysql'
});

function initModels(sequelize: Sequelize) {
  initUserModel(sequelize);
  initFriendModel(sequelize);
  initMessageModel(sequelize);
}

sequelize.authenticate().then(() => {
  initModels(sequelize);

  console.log('Connection established');
  initSocketIO(httpServer);
}).catch((err: any) => console.error('Unable to connect to the database: ', err));

httpServer.listen(port, () => logger.info('Express server started on port: ' + port));