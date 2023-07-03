import {IService} from "./interface/IService";
import {ClassName} from "../util/dictionary";
import {Model, MongooseError, Types} from "mongoose";
import {IgnoreReferencesType} from "../util/type/IIgnoreReferencesType";
import {Injectable} from "@nestjs/common";

@Injectable()
export abstract class BaseService<T> implements IService{

    protected constructor(isWarningOn: boolean = true) {
        this.refsInModel = [];
        this.isWarningOn = isWarningOn;
    }

    public model: Model<T>;
    protected refsInModel: ClassName[];
    private readonly isWarningOn: boolean;

    public create = async (input: any): Promise<object | MongooseError> => {
        this.checkClassValidity();
        return this.model.create(input);
    }


    public readById = async (_id: string): Promise<object | null | MongooseError> => {
        //this.checkClassValidity();
        return this.model.findById(_id);
    }

    public readOneWithCollections = async (_id: string, withQuery: string): Promise<object | null | MongooseError> => {
        this.checkClassValidity();
        const withRefs: ClassName[] = withQuery.split('_') as ClassName[];
        const dbQuery = this.model.findById(_id);

        if(withRefs.length === 0)
            return dbQuery;

        for(let i=0; i<withRefs.length; i++){
            const refModelName = withRefs[i];

            if(this.refsInModel.includes(refModelName))
                dbQuery.populate(refModelName);
        }
        const dbQueryResp = await dbQuery.exec() as any;
        if(dbQueryResp === null || dbQueryResp._doc === null)
            return null;

        return {...dbQueryResp._doc, ...dbQueryResp.$$populatedVirtuals};
    }

    public readOneWithAllCollections = async (_id: string): Promise<object | null | MongooseError> => {
        this.checkClassValidity();
        const dbQuery = this.model.findById(_id) as any;

        for(let i=0; i<this.refsInModel.length; i++)
            dbQuery.populate(this.refsInModel[i]);


        const dbQueryResp = await dbQuery.exec() as any;
        if(dbQueryResp === null || dbQueryResp._doc === null)
            return null;

        return {...dbQueryResp._doc, ...dbQueryResp.$$populatedVirtuals};
    }

    public readAll = async (): Promise<Array<object>> => {
        this.checkClassValidity();
        return this.model.find();
    }

    public updateById = async (input: any): Promise<object | MongooseError> => {
        this.checkClassValidity();
        return this.model.updateOne({_id: input._id}, input, {rawResult: true});
    }

    public deleteById = async (_id: string, ignoreReferences?: IgnoreReferencesType): Promise<Object | null | MongooseError> => {
        this.checkClassValidity();
        const entityToDelete = await this.model.findById(_id);
        if(!entityToDelete)
            return null;

        await this.clearCollectionReferences(_id, ignoreReferences);

        return this.model.deleteOne({_id});
    }

    public deleteByCondition = async (condition: object, ignoreReferences?: IgnoreReferencesType): Promise<Object | null | MongooseError> => {
        this.checkClassValidity();
        const entityToDelete = await this.model.findOne(condition);
        if(!entityToDelete)
            return null;

        const _id = (entityToDelete as any)._id;

        await this.clearCollectionReferences(_id, ignoreReferences);

        return this.model.deleteOne({_id: entityToDelete._id});
    }

    private checkClassValidity = () => {
        if(!this.model)
            throw new Error('Model is not defined for BaseService class. Please set the model for the extending class');
        if(this.isWarningOn && this.refsInModel.length === 0)
            console.log(
                'Warning: the field refsInModel[] is not specified, that may cause problems with querying related collections. \n' +
                'Ignore this warning, if there is no references to the model. \n' +
                'You may want to hide this warning by providing false in the BaseService constructor function.'
            );
    }

    protected abstract clearCollectionReferences(_id: string | Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void>;
}
