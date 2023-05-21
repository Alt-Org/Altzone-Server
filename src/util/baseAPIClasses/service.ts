import mongoose, {Model, MongooseError} from "mongoose";
import {UpdateResult} from "mongodb";
import {IUpdateInput} from "./service.d";
import RequestHelper from "../request/requestHelper";
import {ClassName, CollectionRefs} from "../dictionary";
import {ICollectionRefInfo} from "../dictionary/collectionRefs";
import ModelFactory from "./factory/modelFactory";

const requestHelper = new RequestHelper();
export default abstract class Service<T>{
    protected constructor(modelName: ClassName){
        this.modelName = modelName;
        //mongoose.model() will crush
        this.model = new ModelFactory().create(modelName);
    }
    protected readonly modelName: ClassName;
    protected readonly model: Model<T>;

    public create = async (input: any): Promise<Object | MongooseError> => {
        return this.model.create(input);
    }

    public readById = async (_id: string): Promise<Object | null | MongooseError> => {
        return this.model.findById(_id);
    }

    public readOneWithCollections = (_id: string, withQuery: string): Promise<Object | null | MongooseError | any> | null | any => {
        const query = this.model.findById(_id);

        const inputCollections: string[] = withQuery.split('_');

        if(inputCollections.length === 0)
            return query;

        const refInfo = CollectionRefs.values[this.modelName];
        const notInModelRefs = refInfo.notInModelRefs;
        const inModelRefs = refInfo.inModelRefs;
        for(let i=0; i<inputCollections.length; i++){
            const refModelName: ClassName = inputCollections[i] as ClassName;

            if(inModelRefs.includes(refModelName)){
                query.populate(refModelName);
                continue;
            }
            //TODO: add population for not specified in the model collections
            for(let i=0; i<notInModelRefs.length; i++){
                const info = notInModelRefs[i];
                const refName = info.modelName;
                const foreignKey = info.foreignKey;
                if(refName !== refModelName)
                    continue;

                const filter = {[foreignKey]: _id} as Object;

                if(info.isOne)
                    query.populate({path: refName, match: filter});
                else
                    query.populate({path: refName, match: filter});
            }
        }

        return query;
    }

    public readOneAllCollections = (_id: string): Promise<Object | null | MongooseError | any> | null | any => {
        return requestHelper.populateCollections(this.modelName, _id, CollectionRefs.values[this.modelName].inModelRefs);
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