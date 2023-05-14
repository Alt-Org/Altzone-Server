import express from 'express';
import {connect as connectToDB, set as mongooseSet } from 'mongoose';
import dotenv from 'dotenv'
dotenv.config();

//Routes imports
import { rootRouter } from './root';
import { clanRouter } from './clan';
import { characterClassRouter } from './characterClass';
import { customCharacterRouter } from './customCharacter';
import { battleCharacterRouter } from './battleCharacter';
import { PlayerDataRouter } from './playerData';
import { furnitureRouter } from './furniture';
import { raidRoomRouter } from './raidRoom';
import bodyParser from "body-parser";

const app = express();

// Set up database connection
const mongoURL = process.env.MONGO_URL || 'mongodb://127.0.0.1';
const mongoPort = process.env.MONGO_PORT || '27017';
const dbName = process.env.MONGO_DB_NAME || 'altzone';
const mongoString = mongoURL + ':' + mongoPort + '/' + dbName;

mongooseSet('strictQuery', true);
connectToDB(mongoString).then(
    () => { console.log('Connected to DB successfully'); },
    (err) => { console.log(err); }
);

//Outside middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Routes
app.use('/', rootRouter);
app.use('/clan', clanRouter);
app.use('/characterClass', characterClassRouter);
app.use('/customCharacter', customCharacterRouter);
app.use('/battleCharacter', battleCharacterRouter);
app.use('/playerData', new PlayerDataRouter().router);
app.use('/furniture', furnitureRouter);
app.use('/raidRoom', raidRoomRouter);

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;

app.listen(Number(PORT), HOST, () => {
    console.log(`Server running: http://${HOST}:${PORT}`);
});

export default app;