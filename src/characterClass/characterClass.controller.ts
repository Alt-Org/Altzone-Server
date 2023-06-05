import {Request, Response} from "express";
import {sendErrorsToClient} from "../util/response/errorHandler";
import CharacterClassService from "./characterClass.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {ClassName} from "../util/dictionary";
import IController from "../util/baseAPIClasses/IController";
import ClanParser from "../clan/clan.parser";
import {IFieldParser} from "../util/parser";

export default class CharacterClassController implements IController{
    public constructor() {
        this.service = new CharacterClassService();
        this.errorThrower = new DefaultResponseErrorThrower(ClassName.CHARACTER_CLASS);
        this.parser = new ClanParser();
    }

    private readonly service: CharacterClassService;
    private readonly errorThrower: DefaultResponseErrorThrower;
    private readonly parser: IFieldParser;

    create = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await this.service.create(req.body);

            const result = this.parser.parseFromAPIToGame(respObj);
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
                respObj = await this.service.readById(req.params._id);
            else if(query.with && (typeof query.with == 'string'))
                respObj = await this.service.readOneWithCollections(req.params._id, query.with);
            else if(query.all !== null)
                respObj = await this.service.readOneAllCollections(req.params._id);

            this.errorThrower.throwReadErrorsIfFound(respObj, '_id');
            const result = this.parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await this.service.readAll();
            this.errorThrower.throwReadErrorsIfFound(respObj, '_id');

            const result = this.parser.parseFromAPIToGame(respObj);
            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await this.service.updateById(req.body);
            this.errorThrower.throwUpdateErrorsIfFound(respObj, '_id');

            res.status(204).send();
        }catch (err: unknown) {
            sendErrorsToClient(err, res);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const respObj = await this.service.deleteById(req.params._id);
            this.errorThrower.throwDeleteErrorsIfFound(respObj, '_id');

            res.status(204).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}