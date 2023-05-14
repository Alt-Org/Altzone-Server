import {Request, Response} from "express";
import {sendErrorsToClient} from "../util/response/errorHandler";
import CharacterClassService from "./characterClass.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {FieldParserFactory} from "../util/parser";
import {ClassName} from "../util/dictionary";
import {ControllerAbstract} from "../util/baseAPIClasses";

const characterClassService = new CharacterClassService();
const errorThrower = new DefaultResponseErrorThrower();
const parser = new FieldParserFactory().createParser(ClassName.CHARACTER_CLASS);

export default class CharacterClassController extends ControllerAbstract{
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
            errorThrower.throwReadErrorsIfFound(respObj, ClassName.CHARACTER_CLASS, '_id');

            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await characterClassService.readAll();
            errorThrower.throwReadErrorsIfFound(respObj, ClassName.CHARACTER_CLASS, '_id');

            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await characterClassService.updateById(req.body);
            errorThrower.throwUpdateErrorsIfFound(respObj, ClassName.CHARACTER_CLASS, '_id');

            res.status(204).send();
        }catch (err: unknown) {
            sendErrorsToClient(err, res);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await characterClassService.deleteById(req.params._id);
            errorThrower.throwDeleteErrorsIfFound(respObj, ClassName.CHARACTER_CLASS, '_id');

            res.status(204).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}