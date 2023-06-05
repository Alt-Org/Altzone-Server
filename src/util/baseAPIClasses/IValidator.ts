import {ValidationChain} from "express-validator";
import e from "express";

export default interface IValidator{
    validateCreate: (ValidationChain | ((req: e.Request<any, any, any, any, Record<string, any>>, res: e.Response<any>, next: e.NextFunction) => void))[];
    validateRead: (ValidationChain | ((req: e.Request<any, any, any, any, Record<string, any>>, res: e.Response<any>, next: e.NextFunction) => void))[];
    validateUpdate: (ValidationChain | ((req: e.Request<any, any, any, any, Record<string, any>>, res: e.Response<any>, next: e.NextFunction) => void))[];
    validateDelete: (ValidationChain | ((req: e.Request<any, any, any, any, Record<string, any>>, res: e.Response<any>, next: e.NextFunction) => void))[];
}