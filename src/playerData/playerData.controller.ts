import {Request, Response} from "express";
import {sendErrorsToClient} from "../util/response/errorHandler";
import PlayerDataService from "./playerData.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {FieldParserFactory} from "../util/parser";
import {ClassName} from "../util/dictionary";
import ControllerAbstract from "../util/baseAPIClasses/controllerAbstract";

const service = new PlayerDataService();
const errorThrower = new DefaultResponseErrorThrower();
const parser = new FieldParserFactory().createParser(ClassName.PLAYER_DATA);

export default class PlayerDataController extends ControllerAbstract{
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
            const query = req.query;
            let respObj = null;

            if(Object.keys(query).length === 0)
                respObj = await service.readById(req.params._id);
            else if(query.with && (typeof query.with == 'string')){
                const resp = await service.readOneWithCollections(req.params._id, query.with);
                respObj = resp?.toObject();
            } else if(query.all !== null){
                const resp = await service.readOneAllCollections(req.params._id);
                respObj = resp?.toObject();
            }

            errorThrower.throwReadErrorsIfFound(respObj, ClassName.PLAYER_DATA, '_id');
            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.readAll();
            errorThrower.throwReadErrorsIfFound(respObj, ClassName.PLAYER_DATA, '_id');

            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.updateById(req.body);
            errorThrower.throwUpdateErrorsIfFound(respObj, ClassName.PLAYER_DATA, '_id');

            res.status(204).send();
        }catch (err: unknown) {
            sendErrorsToClient(err, res);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.deleteById(req.params._id);
            errorThrower.throwDeleteErrorsIfFound(respObj, ClassName.PLAYER_DATA, '_id');

            res.status(204).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}