import {Request, Response} from "express";

export default abstract class ControllerAbstract{
    abstract create(req: Request, res: Response): Promise<void>;
    abstract get(req: Request, res: Response): Promise<void>;
    abstract getAll(req: Request, res: Response): Promise<void>;
    abstract update(req: Request, res: Response): Promise<void>;
    abstract delete(req: Request, res: Response): Promise<void>;
}