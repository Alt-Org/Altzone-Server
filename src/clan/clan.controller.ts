import {Request, Response } from "express";
import { sendErrorsToClient } from "../util/response/errorHandler";
import ClanService from "./clan.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {FieldParserFactory, ParserType} from "../util/parser";

const clanService = new ClanService();
const errorThrower = new DefaultResponseErrorThrower();
const parser = new FieldParserFactory().createParser(ParserType.CLAN);

export default class ClanController{
    create = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await clanService.create(req.body);

            const result = parser.parseFromAPIToGame(respObj);
            res.status(201).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    get = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await clanService.readById(req.params._id);
            errorThrower.throwReadErrorsIfFound(respObj, 'Clan', '_id');

            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await clanService.readAll();
            errorThrower.throwReadErrorsIfFound(respObj, 'Clan', '_id');

            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await clanService.updateById(req.body);
            errorThrower.throwUpdateErrorsIfFound(respObj, 'Clan', '_id');

            res.status(204).send();
        }catch (err: unknown) {
            sendErrorsToClient(err, res);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await clanService.deleteById(req.params._id);
            errorThrower.throwDeleteErrorsIfFound(respObj, 'Clan', '_id');

            res.status(204).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}