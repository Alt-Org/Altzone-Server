import {Request, Response} from "express";
import {sendErrorsToClient} from "../util/response/errorHandler";
import RaidRoomService from "./raidRoom.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {FieldParserFactory} from "../util/parser";
import {ClassName} from "../util/dictionary";

const service = new RaidRoomService();
const errorThrower = new DefaultResponseErrorThrower();
const parser = new FieldParserFactory().createParser(ClassName.RAID_ROOM);

export default class RaidRoomController {
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
            errorThrower.throwReadErrorsIfFound(respObj, ClassName.RAID_ROOM, '_id');

            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.readAll();
            errorThrower.throwReadErrorsIfFound(respObj, ClassName.RAID_ROOM, '_id');

            const result = parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.updateById(req.body);
            errorThrower.throwUpdateErrorsIfFound(respObj, ClassName.RAID_ROOM, '_id');

            res.status(204).send();
        }catch (err: unknown) {
            sendErrorsToClient(err, res);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await service.deleteById(req.params._id);
            errorThrower.throwDeleteErrorsIfFound(respObj, ClassName.RAID_ROOM, '_id');

            res.status(204).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}