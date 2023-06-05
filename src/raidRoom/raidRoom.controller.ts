import {Request, Response} from "express";
import {sendErrorsToClient} from "../util/response/errorHandler";
import RaidRoomService from "./raidRoom.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {ClassName} from "../util/dictionary";
import RaidRoomParser from "./raidRoom.parser";
import IController from "../util/baseAPIClasses/IController";

const service = new RaidRoomService();
const errorThrower = new DefaultResponseErrorThrower(ClassName.RAID_ROOM);
const parser = new RaidRoomParser();

export default class RaidRoomController implements IController{
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
            else if(query.with && (typeof query.with == 'string'))
                respObj = await service.readOneWithCollections(req.params._id, query.with);
            else if(query.all !== null)
                respObj = await service.readOneAllCollections(req.params._id);

            errorThrower.throwReadErrorsIfFound(respObj, '_id');
            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.readAll();
            errorThrower.throwReadErrorsIfFound(respObj, '_id');

            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.updateById(req.body);
            errorThrower.throwUpdateErrorsIfFound(respObj, '_id');

            res.status(204).send();
        }catch (err: unknown) {
            sendErrorsToClient(err, res);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.deleteById(req.params._id);
            errorThrower.throwDeleteErrorsIfFound(respObj, '_id');

            res.status(204).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}