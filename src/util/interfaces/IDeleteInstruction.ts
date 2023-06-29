import {ClassName} from "../dictionary";

export interface IDeleteInstruction {
    collectionsToDelete: {modelName: ClassName, _id: string}[];
    referencesToNull: {modelName: ClassName, _id: string}[];
}