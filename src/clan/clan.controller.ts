import {ICreateClanInput, IUpdateClanInput} from "./clan";
import {Request, Response } from "express";
import { sendErrorsToClient } from "../util/response/errorHandler";
import ClanService from "./clan.service";

const clanService = new ClanService();

export default class ClanController{
    create = async (req: Request, res: Response): Promise<void> => {
        try{
            const { name, tag, gameCoins } = req.body;
            const newClan : ICreateClanInput = { name, tag, gameCoins };
            const result = await clanService.create(newClan);

            res.status(201).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    get = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await clanService.readById(req.params.id);

            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await clanService.readAll();

            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const { id, name, tag, gameCoins } = req.body;
            const updateClan : IUpdateClanInput = { id, name, tag, gameCoins };

            const isSuccess = await clanService.update(updateClan);

            let respStatusCode = 204;
            if(!isSuccess)
                respStatusCode = 500;

            res.status(respStatusCode).send();
        }catch (err: unknown) {
            sendErrorsToClient(err, res);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const isSuccess = await clanService.deleteById(req.params.id);

            let respStatusCode = 204;
            if(!isSuccess)
                respStatusCode = 500;

            res.status(respStatusCode).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}