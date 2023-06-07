import RouterBase from "../util/baseAPIClasses/routerBase";
import IValidator from "../util/baseAPIClasses/IValidator";
import IController from "../util/baseAPIClasses/IController";
import IRouter from "../util/baseAPIClasses/IRouter";
import {Router} from "express";
import CustomCharacterValidator from "./customCharacter.validator";
import CustomCharacterController from "./customCharacter.controller";

export default class CustomCharacterRouter{
    public constructor(){
        this.validator = new CustomCharacterValidator();
        this.controller = new CustomCharacterController();

        this.baseRouter = new RouterBase(this.validator, this.controller);
        this.baseRouter.addPost('');
        this.baseRouter.addGet('/:_id');
        this.baseRouter.addGet('', [this.controller.getAll]);
        this.baseRouter.addPut('');
        this.baseRouter.addDelete('/:_id');
    }

    private readonly validator: IValidator;
    private readonly controller: IController;
    private readonly baseRouter: IRouter;

    public getRouter = (): Router => this.baseRouter.router;
}