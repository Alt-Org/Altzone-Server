import {Router} from 'express';
import {IFieldParser} from "../parser";
import IValidator from "./IValidator";
import IController from "./IController";
import IRouter from "./IRouter";

export default class RouterBase implements IRouter{
    public constructor(parser: IFieldParser, validator: IValidator, controller: IController){
        this.parser = parser;
        this.validator = validator;
        this.controller= controller;

        this.router = Router();
    }

    public addPost = (path?: string, handlers?: any[]) => {
        this.router.post(path || '', this.parser.parseFromGameToAPI, this.validator.validateCreate, this.controller.create);
    }

    public addGet = (path?: string, handlers?: any[]) => {
        const chosenPath = path !== undefined ? path : '/_:id';

        if(handlers == null || handlers.length === 0)
            this.router.get(chosenPath, this.validator.validateRead, this.controller.get);
        else
            this.router.get(chosenPath, handlers);
    }

    public addPut = (path?: string, handlers?: any[]) => {
        this.router.put(path || '', this.parser.parseFromGameToAPI, this.validator.validateUpdate, this.controller.update);
    }

    public addDelete = (path?: string, handlers?: any[]) => {
        this.router.delete(path || '/:_id', this.validator.validateDelete, this.controller.delete);
    }

    private parser;
    private readonly validator: IValidator;
    private readonly controller: IController;

    public readonly router: Router;
}