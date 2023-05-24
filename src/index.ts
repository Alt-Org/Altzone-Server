import express from 'express';
import {connect as connectToDB, set as mongooseSet } from 'mongoose';
import dotenv from 'dotenv'
dotenv.config();

//Routes imports
import { rootRouter } from './root';
import { ClanRouter } from './clan';
import { CharacterClassRouter } from './characterClass';
import { CustomCharacterRouter } from './customCharacter';
import { BattleCharacterRouter } from './battleCharacter';
import { PlayerDataRouter } from './playerData';
import { FurnitureRouter } from './furniture';
import { RaidRoomRouter } from './raidRoom';
import bodyParser from "body-parser";

const app = express();

// Set up database connection
const mongoUser = process.env.MONGO_USERNAME || 'root';
const mongoPassword = process.env.MONGO_PASSWORD || 'password';
const mongoHost = process.env.MONGO_HOST || '127.0.0.1';
const mongoPort = process.env.MONGO_PORT || '27017';
const dbName = process.env.MONGO_DB_NAME || 'altzone';
const mongoString = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}`;

mongooseSet('strictQuery', true);
connectToDB(mongoString, {dbName: dbName}).then(
    () => { console.log('Connected to DB successfully'); },
    (err) => { console.log(err); }
);

//Outside middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Routes
app.use('/', rootRouter);
app.use('/clan', new ClanRouter().router);
app.use('/characterClass', new CharacterClassRouter().router);
app.use('/customCharacter', new CustomCharacterRouter().router);
app.use('/battleCharacter', new BattleCharacterRouter().router);
app.use('/playerData', new PlayerDataRouter().router);
app.use('/furniture', new FurnitureRouter().router);
app.use('/raidRoom', new RaidRoomRouter().router);

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;

app.listen(Number(PORT), HOST, () => {
    console.log(`Server running: http://${HOST}:${PORT}`);
});

export default app;