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

const configContents = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/config/config.json'), { encoding: 'utf8' }));

const databaseName = configContents.development.database;
const username = configContents.development.username;
const password: string = configContents.development.password;
const dbPort = configContents.development.port;
const dialect = configContents.development.dialect;
const host = configContents.development.host;

console.log('host', host);

// Start the server
const port = Number(process.env.PORT || 3000);

const httpServer = http.createServer(app);

const sequelize = new Sequelize(databaseName, username, password, {
  host: host,
  port: dbPort,
  dialect
});

function initModels(sequelize: Sequelize) {
  initUserModel(sequelize);
  initFriendModel(sequelize);
  initMessageModel(sequelize);
  initSystemConfigs(sequelize);
}

sequelize.authenticate().then(() => {
  initModels(sequelize);

  console.log('Connection established');
  initSocketIO(httpServer);
}).catch((err: any) => console.error('Unable to connect to the database: ', err));

httpServer.listen(port, () => logger.info('Express server started on port ' + port));
