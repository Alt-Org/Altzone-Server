import {Router} from 'express';
import {FieldParserFactory} from "../parser";
import {ClassName} from "../dictionary";

//TODO: base class for routers extension
//TODO: Controller factory
//TODO: validator factory
export default class RouterBase{
    constructor(modelName: ClassName){
        this.modelName = modelName;
    }
    protected readonly modelName;

    const router = Router();
    const controller = new PlayerDataController();
    const validator = new PlayerDataValidator();
    const parser = new FieldParserFactory().createParser(ClassName.PLAYER_DATA);

    router.post('/', parser.parseFromGameToAPI, validator.validateCreate, controller.create);
    router.get('/:_id', validator.validateRead, controller.get);
    router.get('/', controller.getAll);
    router.put('/', parser.parseFromGameToAPI, validator.validateUpdate, controller.update);
    router.delete('/:_id', validator.validateDelete, controller.delete);
}