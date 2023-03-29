import {Model, Schema} from "mongoose";

interface IValidateDeleteFKInput {
    modelReferring: Model<any>;
    fkObj: Object<string, Schema.Types.ObjectId>
}

export { IValidateDeleteFKInput };