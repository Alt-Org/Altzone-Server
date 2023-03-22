import { Request, Response } from "express";
import { sendErrorsToClient } from "../util/response/errorHandler";
import CharacterClassService from "./characterClass.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";

const characterClassService = new CharacterClassService();
const errorThrower = new DefaultResponseErrorThrower();

export default class CharacterClassController {
    create = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await characterClassService.create(req.body);

            res.status(201).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    get = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await characterClassService.readById(req.params._id);
            errorThrower.throwReadErrorsIfFound(result, 'CharacterClass', '_id');

            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await characterClassService.readAll();
            errorThrower.throwReadErrorsIfFound(result, 'CharacterClass', '_id');

            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await characterClassService.updateById(req.body);
            errorThrower.throwUpdateErrorsIfFound(result, 'CharacterClass', '_id');

            res.status(204).send();
        }catch (err: unknown) {
            sendErrorsToClient(err, res);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await characterClassService.deleteById(req.params._id);
            errorThrower.throwDeleteErrorsIfFound(result, 'CharacterClass', '_id');

            res.status(204).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}