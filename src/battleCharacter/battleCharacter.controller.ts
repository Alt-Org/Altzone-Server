import {Request, Response} from "express";
import {sendErrorsToClient} from "../util/response/errorHandler";
import BattleCharacterService from "./battleCharacter.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {FieldParserFactory} from "../util/parser";
import {ClassName} from "../util/dictionary";
import ControllerAbstract from "../util/baseAPIClasses/controllerAbstract";
import RequestError from "../util/error/requestError";

const service = new BattleCharacterService();
const errorThrower = new DefaultResponseErrorThrower();
const parser = new FieldParserFactory().createParser(ClassName.BATTLE_CHARACTER);

export default class BattleCharacterController extends ControllerAbstract{
    create = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.create(req.body);

            const result = parser.parseFromAPIToGame(respObj);
            res.status(201).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    get = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.readById(req.params._id);
            errorThrower.throwReadErrorsIfFound(respObj, ClassName.BATTLE_CHARACTER, '_id');

            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.readAll();
            errorThrower.throwReadErrorsIfFound(respObj, ClassName.BATTLE_CHARACTER, '_id');

            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    update(req: Request, res: Response): Promise<void> {
        throw new RequestError(405, 'Updating BattleCharacter data is forbidden');
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.deleteById(req.params._id);
            errorThrower.throwDeleteErrorsIfFound(respObj, ClassName.BATTLE_CHARACTER, '_id');

            res.status(204).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}