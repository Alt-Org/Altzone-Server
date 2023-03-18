import { ICreateCharacterClassInput, IUpdateCharacterClassInput } from "./characterClass";
import { Request, Response } from "express";
import { sendErrorsToClient } from "../util/response/errorHandler";
import CharacterClassService from "./characterClass.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";

const characterClassService = new CharacterClassService();
const errorThrower = new DefaultResponseErrorThrower();

export default class CharacterClassController {
    create = async (req: Request, res: Response): Promise<void> => {
        try{
            const { name, mainDefence, speed, resistance, attack, defence } = req.body;
            const newCharacterClass: ICreateCharacterClassInput = { name, mainDefence, speed, resistance, attack, defence };
            const result = await characterClassService.create(newCharacterClass);

            res.status(201).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    get = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await characterClassService.readById(req.params.id);
            errorThrower.throwReadErrorsIfFound(result, 'CharacterClass', 'id');

            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await characterClassService.readAll();
            errorThrower.throwReadErrorsIfFound(result, 'CharacterClass', 'id');

            res.status(200).json(result);
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try{
            const { id, name, mainDefence, speed, resistance, attack, defence } = req.body;
            const updateCharacterClass : IUpdateCharacterClassInput = { id, name, mainDefence, speed, resistance, attack, defence };

            const result = await characterClassService.updateById(updateCharacterClass);
            errorThrower.throwUpdateErrorsIfFound(result, 'CharacterClass', 'id');

            res.status(204).send();
        }catch (err: unknown) {
            sendErrorsToClient(err, res);
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try{
            const result = await characterClassService.deleteById(req.params.id);
            errorThrower.throwDeleteErrorsIfFound(result, 'CharacterClass', 'id');

            res.status(204).send();
        }catch (err) {
            sendErrorsToClient(err, res);
        }
    }
}