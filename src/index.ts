import express, { Request, Response } from 'express';
import {connect as connectToDB, set as mongooseSet } from 'mongoose';
import dotenv from 'dotenv'
dotenv.config();

//Routes imports
import { rootRouter } from './root';
import { clanRouter } from './clan';

const app = express();

// Set up database connection
const mongoString = `${process.env.MONGO_URL}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}` || '';
mongooseSet('strictQuery', true);
connectToDB(mongoString).then(
    ()=>{ console.log('Connected to DB successfully'); },
    (err)=>{ console.log(err); }
);

//Outside middlewares
app.use(express.json());

//Routes
app.use('/', rootRouter);
app.use('/clan', clanRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});

export default app;