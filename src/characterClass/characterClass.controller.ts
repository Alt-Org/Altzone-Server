import { ICreateCharacterClassInput, IUpdateCharacterClassInput } from "./characterClass";
import { Request, Response } from "express";
import { prepareErrorForResponse } from "../util/error/errorHandler";
import CharacterClassService from "./characterClass.service";

const characterClassService = new CharacterClassService();

export default class CharacterClassController {
    create = async (req: Request, res: Response): Promise<void> => {
        try{
            const { name, mainDefence, speed, resistance, attack, defence } = req.body;
            const newCharacterClass : ICreateCharacterClassInput = { name, mainDefence, speed, resistance, attack, defence };
            const result = await characterClassService.create(newCharacterClass);

            res.status(201).json(result);
        }catch (err) {
            const resStatus = prepareErrorForResponse(err);
            res.status(resStatus).json(err);
        }
    }

    get = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await characterClassService.readById(req.params.id);

            res.status(200).json(result);
        }catch (err) {
            const resStatus = prepareErrorForResponse(err);
            res.status(resStatus).json(err);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await characterClassService.readAll();

            let resStatus = 200;
            if(result && result instanceof Array)
                resStatus = result.length > 0 ? 200 : 404;

            res.status(resStatus).json(result);
        }catch (err) {
            const resStatus = prepareErrorForResponse(err);
            res.status(resStatus).json(err);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const { id, name, mainDefence, speed, resistance, attack, defence } = req.body;
            const updateCharacterClass : IUpdateCharacterClassInput = { id, name, mainDefence, speed, resistance, attack, defence };

            const isSuccess = await characterClassService.update(updateCharacterClass);

            let respStatusCode = 204;
            if(!isSuccess)
                respStatusCode = 500;

            res.status(respStatusCode).send();
        }catch (err: unknown) {
            const resStatus = prepareErrorForResponse(err);

            res.status(resStatus).json(err);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const isSuccess = await characterClassService.deleteById(req.params.id);

            let respStatusCode = 204;
            if(!isSuccess)
                respStatusCode = 500;

            res.status(respStatusCode).send();
        }catch (err) {
            const resStatus = prepareErrorForResponse(err);
            res.status(resStatus).json(err);
        }
    }
}