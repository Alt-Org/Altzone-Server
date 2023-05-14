import {ValidationChain} from "express-validator";
import e from "express";

export default abstract class ValidatorAbstract{
    abstract validateCreate: (ValidationChain | ((req: e.Request<any, any, any, any, Record<string, any>>, res: e.Response<any>, next: e.NextFunction) => void))[];
    abstract validateRead: (ValidationChain | ((req: e.Request<any, any, any, any, Record<string, any>>, res: e.Response<any>, next: e.NextFunction) => void))[];
    abstract validateUpdate: (ValidationChain | ((req: e.Request<any, any, any, any, Record<string, any>>, res: e.Response<any>, next: e.NextFunction) => void))[];
    abstract validateDelete: (ValidationChain | ((req: e.Request<any, any, any, any, Record<string, any>>, res: e.Response<any>, next: e.NextFunction) => void))[];
}