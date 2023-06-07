import {Request, Response} from "express";
import {sendErrorsToClient} from "../util/response/errorHandler";
import BattleCharacterService from "./battleCharacter.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {ClassName} from "../util/dictionary";
import RequestError from "../util/error/requestError";
import IController from "../util/baseAPIClasses/IController";

export default class BattleCharacterController implements IController{
    public constructor() {
        this.service = new BattleCharacterService();
        this.errorThrower = new DefaultResponseErrorThrower(ClassName.BATTLE_CHARACTER);
    }

    private readonly service: BattleCharacterService;
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

    public update(req: Request, res: Response): Promise<void> {
        throw new RequestError(405, 'Updating BattleCharacter data is forbidden');
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