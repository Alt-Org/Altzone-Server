import {Request, Response} from "express";
import {sendErrorsToClient} from "../util/response/errorHandler";
import PlayerService from "./player.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {ClassName} from "../util/dictionary";
import IController from "../util/baseAPIClasses/IController";

export default class PlayerController implements IController{
    public constructor() {
        this.service = new PlayerService();
        this.errorThrower = new DefaultResponseErrorThrower(ClassName.PLAYER);
    }

    private readonly service: PlayerService;
    private readonly errorThrower: DefaultResponseErrorThrower;

    public create = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await this.service.create(req.body);

            res.status(201).json(respObj);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    public get = async (req: Request, res: Response): Promise<void> => {
        try{
            const query = req.query;
            let respObj = null;

            if(Object.keys(query).length === 0)
                respObj = await this.service.readById(req.params._id);
            else if(query.with && (typeof query.with == 'string'))
                respObj = await this.service.readOneWithCollections(req.params._id, query.with);
            else if(query.all !== null)
                respObj = await this.service.readOneAllCollections(req.params._id);

            this.errorThrower.throwReadErrorsIfFound(respObj, '_id');
            res.status(200).json(respObj);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    public getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await this.service.readAll();
            this.errorThrower.throwReadErrorsIfFound(respObj, '_id');

            res.status(200).json(respObj);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    public update = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await this.service.updateById(req.body);
            this.errorThrower.throwUpdateErrorsIfFound(respObj, '_id');

            res.status(204).send();
        }catch (err: unknown) {
            sendErrorsToClient(err, res);
        }
    }

    public delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await this.service.deleteById(req.params._id);
            this.errorThrower.throwDeleteErrorsIfFound(respObj, '_id');

            res.status(204).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}