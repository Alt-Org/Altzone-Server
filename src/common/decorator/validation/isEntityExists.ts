import {validate, ValidationArguments, ValidatorConstraintInterface} from "class-validator";
import {Model} from "mongoose";
import {ModelName} from "../../enum/modelName.enum";
import { BadRequestException } from "@nestjs/common";
import { ObjectId } from "mongodb";

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
        
        let parsedValue: any = value;

        if(this.searchField.indexOf('_id') !== -1){
            try{
                parsedValue = new ObjectId(value);
            } catch(e){
                console.error('Error occured on converting _id string to mongo object', e);
                throw new BadRequestException(`The ${this.searchField} must be mongo _id`);
            }
        }

        const condition: {} = {[this.searchField]: parsedValue};
        return await this.entityModel.findOne(condition) != null;
    }

    public defaultMessage(args: ValidationArguments) {
        return `${this.entityName} with that ${this.searchField} does not exists`;
    }

    protected setEntityModel(model: Model<T>){
        this.entityModel = model;
    }
}