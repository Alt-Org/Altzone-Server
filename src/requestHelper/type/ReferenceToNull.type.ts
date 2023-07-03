import {ClassName} from "../../util/dictionary";
import {Types} from "mongoose";

export type ReferenceToNullType = {
    modelName: ClassName,
    filter: {[key: string]: string | Types.ObjectId},
    nullIds: {[key: string]: null}
};