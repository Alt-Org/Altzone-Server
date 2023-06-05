import RouterBase from "../util/baseAPIClasses/routerBase";
import {IFieldParser} from "../util/parser";
import IValidator from "../util/baseAPIClasses/IValidator";
import IController from "../util/baseAPIClasses/IController";
import IRouter from "../util/baseAPIClasses/IRouter";
import {Router} from "express";
import CharacterClassParser from "./characterClass.parser";
import CharacterClassValidator from "./characterClass.validator";
import CharacterClassController from "./characterClass.controller";

export default class CharacterClassRouter{
    constructor(){
        this.parser = new CharacterClassParser();
        this.validator = new CharacterClassValidator();
        this.controller = new CharacterClassController();

        this.baseRouter = new RouterBase(this.parser, this.validator, this.controller);
        this.baseRouter.addPost('');
        this.baseRouter.addGet('/:_id');
        this.baseRouter.addGet('', [this.controller.getAll]);
        this.baseRouter.addPut('');
        this.baseRouter.addDelete('/:_id');
    }

    private readonly parser: IFieldParser;
    private readonly validator: IValidator;
    private readonly controller: IController;
    private readonly baseRouter: IRouter;

    public getRouter = (): Router => this.baseRouter.router;
}