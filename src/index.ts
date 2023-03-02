import express, { Request, Response } from 'express';
import dotenv from 'dotenv'
dotenv.config();

//Routes imports
import { rootRouter } from './root';

const app = express();

//Outside middlewares
app.use(express.json());

//Routes
app.use('/', rootRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});

export default app;