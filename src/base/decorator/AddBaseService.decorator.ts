import {Model, MongooseError} from "mongoose";
import {ClassName} from "../../util/dictionary";
import {IgnoreReferencesType} from "../../util/type/IIgnoreReferencesType";

export const AddBaseService = () => {
    return function<T extends {
        new (...args: any[]): {
            clearCollectionReferences: Function;
            refsInModel: ClassName[];
            model: Model<any>
        }
    }>(originalConstructor: T) {
        return class extends originalConstructor{
            constructor(...args: any[]) {
                super(...args);
            }

            public create = async (input: any): Promise<object | MongooseError> => {
                return this.model.create(input);
            }

            public readById = async (_id: string): Promise<object | null | MongooseError> => {
                return this.model.findById(_id);
            }

            public readOneWithCollections = async (_id: string, withQuery: string): Promise<object | null | MongooseError> => {
                const withRefs: ClassName[] = withQuery.split('_') as ClassName[];
                const dbQuery = this.model.findById(_id);

                if(withRefs.length === 0)
                    return dbQuery;

                for(let i=0; i<withRefs.length; i++){
                    const refModelName = withRefs[i];

                    if(this.refsInModel.includes(refModelName))
                        dbQuery.populate(refModelName);
                }

                return await dbQuery.exec();
            }

            public readOneWithAllCollections = async (_id: string): Promise<object | null | MongooseError> => {
                const dbQuery = this.model.findById(_id) as any;

                for(let i=0; i<this.refsInModel.length; i++)
                    dbQuery.populate(this.refsInModel[i]);

                return dbQuery.exec();
            }

            public readAll = async (): Promise<Array<object>> => {
                return this.model.find();
            }

            public updateById = async (input: any): Promise<object | MongooseError> => {
                return this.model.updateOne({_id: input._id}, input, {rawResult: true});
            }

            public deleteById = async (_id: string, ignoreReferences?: IgnoreReferencesType): Promise<Object | null | MongooseError> => {
                const entityToDelete = await this.model.findById(_id);
                if(!entityToDelete)
                    return null;

                await this.clearCollectionReferences(_id, ignoreReferences);

                return this.model.deleteOne({_id});
            }

            public deleteByCondition = async (condition: object, ignoreReferences?: IgnoreReferencesType): Promise<Object | null | MongooseError> => {
                const entityToDelete = await this.model.findOne(condition);
                if(!entityToDelete)
                    return null;

                const _id = (entityToDelete as any)._id;

                await this.clearCollectionReferences(_id, ignoreReferences);

                return this.model.deleteOne({_id: entityToDelete._id});
            }
        }

    }
}