import {ICreateClanInput, IUpdateClanInput} from "./clan";
import ClanModel from "./clan.model";
import {Request, Response } from "express";
import { getStatusForMongooseError } from "../util/error/errorHandler";
import ClanService from "./clan.service";
import {Error as MongooseError} from "mongoose";
import RequestError from "../util/error/RequestError";

const clanService = new ClanService();

export default class ClanController{
    create = async (req: Request, res: Response): Promise<void> => {
        try{
            const { name, tag, gameCoins } = req.body;
            const newClan : ICreateClanInput = { name, tag, gameCoins };
            const result = await ClanModel.create(newClan);

            res.status(201).json(result);
        }catch (err) {
            const resStatus = getStatusForMongooseError(err);
            res.status(resStatus).json(err);
        }
    }

    get = async (req: Request, res: Response): Promise<void> => {
        try{
            const id = req.params.id;
            const result = await ClanModel.findById(id);

            res.status(200).json(result);
        }catch (err) {
            const resStatus = getStatusForMongooseError(err);
            res.status(resStatus).json(err);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await ClanModel.find();

            res.status(200).json(result);
        }catch (err) {
            const resStatus = getStatusForMongooseError(err);
            res.status(resStatus).json(err);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const { id, name, tag, gameCoins } = req.body;
            const newClan : IUpdateClanInput = { id, name, tag, gameCoins };

            const result = await clanService.update(newClan);

            res.status(200).json(result);
        }catch (err: unknown) {
            let resStatus = 500;
            if(err instanceof Error){
                if(err instanceof RequestError)
                    resStatus = err.status;
                if(err instanceof MongooseError)
                    resStatus = getStatusForMongooseError(err);
            }

            res.status(resStatus).json(err);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const id = req.params.id;
            const result = await ClanModel.findByIdAndDelete(id);

            res.status(200).json(result);
        }catch (err) {
            const resStatus = getStatusForMongooseError(err);
            res.status(resStatus).json(err);
        }
    }
}