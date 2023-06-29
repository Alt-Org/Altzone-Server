import {ValidationArguments, ValidatorConstraintInterface} from "class-validator";
import {Model} from "mongoose";

export class isEntityExists<T> implements ValidatorConstraintInterface{
    public constructor(entityName: string, searchField: string = '_id', entityModel?: Model<T>) {
        this.entityName = entityName;
        this.searchField = searchField;
        if(entityModel)
            this.entityModel = entityModel;
    }

    protected readonly entityName: string;
    protected readonly searchField: string;
    protected entityModel: Model<T>;

    async validate(value: string, validationArguments?: ValidationArguments): Promise<boolean> {
        if(!this.entityModel)
            throw new Error(`isEntityExists class validate(): Can not validate entity existing. Model for DB query is not provided. Please provide the model for ${this.entityName} via constructor or setEntityModel(), before using the isEntityExists class`);
        const condition: {} = {[this.searchField]: value};
        return await this.entityModel.findOne(condition) != null;
    }

    defaultMessage(args: ValidationArguments) {
        return `${this.entityName} with that ${this.searchField} does not exists`;
    }

    protected setEntityModel(model: Model<T>){
        this.entityModel = model;
    }
}