import {Model, MongooseError} from "mongoose";
import {UpdateResult} from "mongodb";
import {IUpdateInput} from "./service.d";
import RequestHelper from "../request/requestHelper";
import {ClassName, CollectionRefs} from "../dictionary";
import ModelFactory from "./factory/modelFactory";

const requestHelper = new RequestHelper();
export default abstract class Service<T>{
    protected constructor(modelName: ClassName){
        this.modelName = modelName;
        this.model = new ModelFactory().create(ClassName.PLAYER_DATA);
    }
    protected readonly modelName: string;
    protected readonly model: Model<T>;

    public create = async (input: Object): Promise<Object | MongooseError> => {
        return this.model.create(input);
    }

    public readById = async (_id: string): Promise<Object | null | MongooseError> => {
        return this.model.findById(_id);
    }

    public readOneWithCollections = (_id: string, withQuery: string): Promise<Object | null | MongooseError | any> | null | any => {
        const inputCollections = withQuery.split('_');

        const existingRefs = [];
        for(let i=0; i<inputCollections.length; i++){
            const modelName = inputCollections[i];
            if(CollectionRefs.values[this.modelName].includes(inputCollections[i]))
                existingRefs.push(modelName);
        }

        return requestHelper.populateCollections(ClassName.PLAYER_DATA, _id, existingRefs);
    }

    public readOneAllCollections = (_id: string): Promise<Object | null | MongooseError | any> | null | any => {
        return requestHelper.populateCollections(ClassName.PLAYER_DATA, _id, CollectionRefs.values[this.modelName]);
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