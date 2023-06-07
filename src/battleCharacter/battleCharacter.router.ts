import RouterBase from "../util/baseAPIClasses/routerBase";
import IValidator from "../util/baseAPIClasses/IValidator";
import IController from "../util/baseAPIClasses/IController";
import IRouter from "../util/baseAPIClasses/IRouter";
import {Router} from "express";
import BattleCharacterValidator from "./battleCharacter.validator";
import BattleCharacterController from "./battleCharacter.controller";

export default class BattleCharacterRouter{
    public constructor(){
        this.validator = new BattleCharacterValidator();
        this.controller = new BattleCharacterController();

        this.baseRouter = new RouterBase(this.validator, this.controller);
        this.baseRouter.addPost('');
        this.baseRouter.addGet('/:_id');
        this.baseRouter.addGet('', [this.controller.getAll]);
        this.baseRouter.addDelete('/:_id');
    }

    private readonly validator: IValidator;
    private readonly controller: IController;
    private readonly baseRouter: IRouter;

    public getRouter = (): Router => this.baseRouter.router;
}