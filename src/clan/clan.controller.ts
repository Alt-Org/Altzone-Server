import {ICreateClanInput, IUpdateClanInput} from "./clan";
import ClanModel from "./clan.model";
import {Request, Response } from "express";
import { getStatusForMongooseError } from "../util/errorHandler";
import {ObjectId} from "mongoose";

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
            const clanToUpdate : IUpdateClanInput = { _id: id, name, tag, gameCoins };
            const result = await ClanModel.updateOne(clanToUpdate);

            res.status(200).json(result);
        }catch (err) {
            const resStatus = getStatusForMongooseError(err);
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