import {Router} from 'express';
import {FieldParserFactory} from "../parser";
import {ClassName} from "../dictionary";
import ControllerAbstract from "./controllerAbstract";
import ControllerFactory from "./factory/controllerFactory";
import ValidatorAbstract from "./validatorAbstract";
import ValidatorFactory from "./factory/validatorFactory";

export default abstract class RouterBase{
    protected constructor(modelName: ClassName){
        this.modelName = modelName;
        this.parser = new FieldParserFactory().createParser(modelName);
        this.validator = new ValidatorFactory().create(modelName);
        this.controller= new ControllerFactory().create(modelName);

        this.router = Router();
        this.router.post('/', this.parser.parseFromGameToAPI, this.validator.validateCreate, this.controller.create);
        this.router.get('/:_id', this.validator.validateRead, this.controller.get);
        this.router.get('/', this.controller.getAll);
        this.router.put('/', this.parser.parseFromGameToAPI, this.validator.validateUpdate, this.controller.update);
        this.router.delete('/:_id', this.validator.validateDelete, this.controller.delete);
    }
    protected readonly modelName: ClassName;

    protected parser;
    protected readonly validator: ValidatorAbstract;
    protected readonly controller: ControllerAbstract;

    public readonly router: Router;
}