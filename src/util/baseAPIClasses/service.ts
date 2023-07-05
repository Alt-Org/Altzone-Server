import mongoose, {Model, MongooseError} from "mongoose";
import {UpdateResult} from "mongodb";
import {IUpdateInput} from "./service.d";
import { CollectionRefs} from "../dictionary";
import {ModelName} from "../../common/enum/modelName.enum";
export default abstract class Service<T>{
    protected constructor(model: Model<T>){
        this.model = model;
        this.modelName = model.modelName as ModelName;
    }
    protected readonly modelName: ModelName;
    protected readonly model: Model<T>;

    public create = async (input: any): Promise<Object | MongooseError> => {
        return this.model.create(input);
    }

    public readById = async (_id: string): Promise<Object | null | MongooseError> => {
        return this.model.findById(_id);
    }

    public readOneWithCollections = async (_id: string, withQuery: string): Promise<Object | null | MongooseError> => {
        const inputCollections: string[] = withQuery.split('_');

        const dbQuery = this.model.findById(_id);

        if(inputCollections.length === 0)
            return dbQuery;

        const refInfo = CollectionRefs.values[this.modelName];

        const inModelRefs = refInfo.inModelRefs;
        for(let i=0; i<inputCollections.length; i++){
            const refModelName: ModelName = inputCollections[i] as ModelName;

            if(inModelRefs.includes(refModelName))
                dbQuery.populate(refModelName);

        }
        const dbQueryResp = await dbQuery.exec() as any;
        if(dbQueryResp === null || dbQueryResp._doc === null)
            return null;

        //Find requested related documents not defined in the model
        const notInModelRefs = refInfo.notInModelRefs;
        const notInModelObjects: Record<any, any> = {};
        for(let i=0; i<inputCollections.length; i++){
            const refModelName: ModelName = inputCollections[i] as ModelName;

            for(let i=0; i<notInModelRefs.length; i++){
                if(notInModelRefs[i].modelName !== refModelName)
                    continue;

                const {modelName, foreignKey, isOne} = notInModelRefs[i];

                const refModel = mongoose.model(modelName);
                const filter = {[foreignKey]: _id} as Object;
                notInModelObjects[modelName] = isOne ? await refModel.findOne(filter) : await refModel.find(filter);
            }
        }

        return {...dbQueryResp._doc, ...dbQueryResp.$$populatedVirtuals, ...notInModelObjects};
    }

    public readOneAllCollections = async (_id: string): Promise<Object | null | MongooseError> => {
        const dbQuery = this.model.findById(_id);

        const refInfo = CollectionRefs.values[this.modelName];

        const inModelRefs = refInfo.inModelRefs;
        for(let i=0; i<inModelRefs.length; i++){
            dbQuery.populate(inModelRefs[i]);
        }
        const dbQueryResp = await dbQuery.exec() as any;
        if(dbQueryResp === null || dbQueryResp._doc === null)
            return null;

        //Find all related documents not defined in the model
        const notInModelRefs = refInfo.notInModelRefs;
        const notInModelObjects: Record<any, any> = {};
        for(let i=0; i<notInModelRefs.length; i++){
            const {modelName, foreignKey, isOne} = notInModelRefs[i];

            const refModel = mongoose.model(modelName);
            const filter = {[foreignKey]: _id} as Object;
            notInModelObjects[modelName] = isOne ? await refModel.findOne(filter) : await refModel.find(filter);
        }

        return {...dbQueryResp._doc, ...dbQueryResp.$$populatedVirtuals, ...notInModelObjects};
    }

    public readAll = async (): Promise<Array<any>> => {
        return this.model.find();
    }

    public updateById = async (input: IUpdateInput): Promise<UpdateResult> => {
        return this.model.updateOne({_id: input._id}, input, {rawResult: true});
    }

    public deleteById = async (_id: string): Promise<Object | null | MongooseError> => {
        return this.model.deleteOne({_id});
    }
}