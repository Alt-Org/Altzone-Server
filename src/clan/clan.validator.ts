import {ICreateClanInput, IUpdateClanInput} from "./clan";
import ClanModel from "./clan.model";
import {Request, Response, NextFunction } from "express";
import { getStatusForMongooseError } from "../util/error/errorHandler";
import { body } from 'express-validator';

export default class ClanValidator{
    validateCreate = (req: Request, res: Response, next: NextFunction) : void => {
        const clanName = req.body.name;

        if(clanName)
            next();
        else{}
    }
}