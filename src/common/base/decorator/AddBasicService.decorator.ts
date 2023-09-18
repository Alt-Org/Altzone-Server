import {Model, MongooseError, QueryOptions} from "mongoose";
import {IgnoreReferencesType} from "../../type/ignoreReferences.type";
import {ModelName} from "../../enum/modelName.enum";
import {IBasicService} from "../interface/IBasicService";
import {DeleteOptionsType} from "../type/deleteOptions.type";
import {Discriminator} from "../../enum/discriminator.enum";

type ClearCollectionReferencesFunction = (_id: any, ignoreReferences?: IgnoreReferencesType) => void | Promise<void>;

export const AddBasicService = () => {
    return function<T extends {
        new (...args: any[]): {
            clearCollectionReferences: ClearCollectionReferencesFunction;
            refsInModel: ModelName[];
            model: Model<any>;
            discriminators: Discriminator[];
        }
    }>(originalConstructor: T) {
        return class extends originalConstructor implements IBasicService{
            constructor(...args: any[]) {
                super(...args);
            }

            public createOne = async (input: any): Promise<object | MongooseError> => {
                return this.model.create(input);
            }

            public readOneById = async (_id: string, includeRefs?: ModelName[]): Promise<object | null | MongooseError> => {
                return includeRefs ? this.model.findById(_id).populate(includeRefs) : this.model.findById(_id);
            }

            public readOneWithCollections = async (_id: string, withQuery: string): Promise<object | null | MongooseError> => {
                const withRefs: ModelName[] = withQuery.split('_') as ModelName[];
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

            public readAll = async (allowedFields?: string[], mongoFilter?: object, sort?: object, count?: number): Promise<Array<object>> => {
                if(allowedFields === null)
                    return [];

                const filter = mongoFilter ? mongoFilter : {};
                const searchOptions: QueryOptions = {};

                if(sort)
                    searchOptions.sort = sort;

                if(count)
                    searchOptions.limit = count;

                return this.model.find(filter, null, searchOptions).select(allowedFields);
            }

            public updateOneById = async (input: any): Promise<object | MongooseError> => {
                return this.model.updateOne({_id: input._id}, input, {rawResult: true});
            }

            public deleteOneById = async (_id: string, ignoreReferences?: IgnoreReferencesType): Promise<Object | null | MongooseError> => {
                const entityToDelete = await this.model.findById(_id);
                if(!entityToDelete)
                    return null;

                await this.clearCollectionReferences(_id, ignoreReferences);

                return this.model.deleteOne({_id});
            }

            public deleteByCondition = async (condition: object, options?: DeleteOptionsType, ignoreReferences?: IgnoreReferencesType): Promise<Object | null | MongooseError> => {
                if(options?.isOne){
                    const entityToDelete = await this.model.findOne(condition);
                    if(!entityToDelete)
                        return null;

                    const _id = entityToDelete._id;
                    await this.clearCollectionReferences(_id, ignoreReferences);

                    return this.model.deleteOne({_id: entityToDelete._id});
                } else{
                    const entitiesToDelete = await this.model.find(condition);
                    if(!entitiesToDelete || entitiesToDelete?.length === 0)
                        return null;

                    for(let i=0; i<entitiesToDelete.length; i++){
                        const entity = entitiesToDelete[i];
                        const _id = (entity as any)._id;
                        await this.clearCollectionReferences(_id, ignoreReferences);
                    }

                    return this.model.deleteMany(condition);
                }
            }
        }

    }
}