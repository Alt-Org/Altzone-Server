import {ICreateClanInput, IUpdateClanInput} from "./clan";
import {Request, Response } from "express";
import { sendErrorsToClient } from "../util/response/errorHandler";
import ClanService from "./clan.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";

const clanService = new ClanService();
const errorThrower = new DefaultResponseErrorThrower();

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
            errorThrower.throwReadErrorsIfFound(result, 'Clan', 'id');

            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await clanService.readAll();
            errorThrower.throwReadErrorsIfFound(result, 'Clan', 'id');

            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const { id, name, tag, gameCoins } = req.body;
            const updateClan : IUpdateClanInput = { id, name, tag, gameCoins };

            const result = await clanService.updateById(updateClan);
            errorThrower.throwUpdateErrorsIfFound(result, 'Clan', 'id');

            res.status(204).send();
        }catch (err: unknown) {
            sendErrorsToClient(err, res);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await clanService.deleteById(req.params.id);
            errorThrower.throwDeleteErrorsIfFound(result, 'Clan', 'id');

            res.status(204).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}