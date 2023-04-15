import { Model, Schema } from "mongoose";
import DeleteError from "../error/deleteError";
import {IValidateDeleteFKInput} from "./schemaValidator.d";

export default class SchemaValidator {
    public static validateCreateUpdateFK =  (model: Model<any>, _id: Schema.Types.ObjectId) => {
        return new Promise(async (resolve, reject) => {
            const objFound = await model.findById(_id);
            if(objFound)
                return resolve(true);
            else
                return reject( new Error(`${model.modelName} with that _id not found`) );
        });
    }

    public static validateDeleteFK =  async (input: IValidateDeleteFKInput) => {
        const customCharacterFound = await input.modelReferring.findOne(input.fkObj);
        if(customCharacterFound)
            throw new DeleteError(400, `There is still ${input.modelReferring.modelName} objects left. Please delete them first`);
    }
}
