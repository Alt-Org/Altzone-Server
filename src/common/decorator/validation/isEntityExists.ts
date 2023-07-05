import {validate, ValidationArguments, ValidatorConstraintInterface} from "class-validator";
import {Model} from "mongoose";
import {ModelName} from "../../enum/modelName.enum";

export class isEntityExists<T> implements ValidatorConstraintInterface{
    public constructor(entityName: ModelName, searchField: string = '_id', entityModel?: Model<T>) {
        this.entityName = entityName;
        this.searchField = searchField;
        if(entityModel)
            this.entityModel = entityModel;
    }

    protected readonly entityName: string;
    protected readonly searchField: string;
    protected entityModel: Model<T>;

    public async validate(value: string, validationArguments?: ValidationArguments): Promise<boolean> {
        if(!this.entityModel)
            throw new Error(`${isEntityExists.name} class ${validate.name}(): Can not validate entity existing. Model for DB query is not provided. Please provide the model for ${this.entityName} via constructor or setEntityModel(), before using the isEntityExists class`);
        const condition: {} = {[this.searchField]: value};
        return await this.entityModel.findOne(condition) != null;
    }

    public defaultMessage(args: ValidationArguments) {
        return `${this.entityName} with that ${this.searchField} does not exists`;
    }

    protected setEntityModel(model: Model<T>){
        this.entityModel = model;
    }
}