import {Request, Response} from "express";
import {sendErrorsToClient} from "../util/response/errorHandler";
import CharacterClassService from "./characterClass.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {FieldParserFactory, ParserType} from "../util/parser";

const characterClassService = new CharacterClassService();
const errorThrower = new DefaultResponseErrorThrower();
const parser = new FieldParserFactory().createParser(ParserType.CHARACTER_CLASS);

export default class CharacterClassController {
    create = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await characterClassService.create(req.body);

            const result = parser.parseFromAPIToGame(respObj);
            res.status(201).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    get = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await characterClassService.readById(req.params._id);
            errorThrower.throwReadErrorsIfFound(respObj, 'CharacterClass', '_id');

            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await characterClassService.readAll();
            errorThrower.throwReadErrorsIfFound(respObj, 'CharacterClass', '_id');

            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await characterClassService.updateById(req.body);
            errorThrower.throwUpdateErrorsIfFound(respObj, 'CharacterClass', '_id');

            res.status(204).send();
        }catch (err: unknown) {
            sendErrorsToClient(err, res);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await characterClassService.deleteById(req.params._id);
            errorThrower.throwDeleteErrorsIfFound(respObj, 'CharacterClass', '_id');

            res.status(204).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}