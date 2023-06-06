import RouterBase from "../util/baseAPIClasses/routerBase";
import {IFieldParser} from "../util/parser";
import IValidator from "../util/baseAPIClasses/IValidator";
import IController from "../util/baseAPIClasses/IController";
import IRouter from "../util/baseAPIClasses/IRouter";
import {Router} from "express";
import CustomCharacterParser from "./customCharacter.parser";
import CustomCharacterValidator from "./customCharacter.validator";
import CustomCharacterController from "./customCharacter.controller";

export default class CustomCharacterRouter{
    public constructor(){
        this.parser = new CustomCharacterParser();
        this.validator = new CustomCharacterValidator();
        this.controller = new CustomCharacterController();

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