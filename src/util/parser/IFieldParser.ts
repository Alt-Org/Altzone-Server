import {NextFunction, Request, Response} from "express";

export default interface IFieldParser {
    parseFromGameToAPI(req: Request, res: Response, next: NextFunction): void;
    parseFromAPIToGame(apiResponse: Object | any): Object | Object[] | null;
}