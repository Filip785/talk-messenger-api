import './LoadEnv'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import http from 'http';
import { initSocketIO } from './Socket';
import { Sequelize } from 'sequelize';
import { initUserModel } from './models/User';
import fs from 'fs';
import path from 'path';
import { initFriendModel } from './models/Friend';
import { initMessageModel } from './models/Message';
import { initSystemConfigs } from './models/SystemConfigs';
import { initErrorModel } from './models/Error';

const configContents = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/config/config.json'), { encoding: 'utf8' }));

const databaseName = configContents.development.database;
const username = configContents.development.username;
const password: string = configContents.development.password;
const port = configContents.development.port;
const dialect = configContents.development.dialect;
const dialectOptions = configContents.development.dialectOptions;
const host = configContents.development.host;

// Start the server
const serverPort = Number(process.env.PORT || 3000);

const httpServer = http.createServer(app);

const sequelize = new Sequelize(databaseName, username, password, {
  host,
  port,
  dialect,
  dialectOptions
});

function initModels(sequelize: Sequelize) {
  initUserModel(sequelize);
  initFriendModel(sequelize);
  initMessageModel(sequelize);
  initSystemConfigs(sequelize);
  initErrorModel(sequelize);
}

sequelize.authenticate().then(() => {
  initModels(sequelize);

  console.log('Connection established');
  initSocketIO(httpServer);
}).catch((err: any) => console.error('Unable to connect to the database: ', err));

httpServer.listen(serverPort, () => logger.info('Express server started on port ' + serverPort));
