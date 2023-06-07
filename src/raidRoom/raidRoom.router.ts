import RouterBase from "../util/baseAPIClasses/routerBase";
import IValidator from "../util/baseAPIClasses/IValidator";
import IController from "../util/baseAPIClasses/IController";
import IRouter from "../util/baseAPIClasses/IRouter";
import {Router} from "express";
import RaidRoomValidator from "./raidRoom.validator";
import RaidRoomController from "./raidRoom.controller";

export default class RaidRoomRouter{
    public constructor(){
        this.validator = new RaidRoomValidator();
        this.controller = new RaidRoomController();

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