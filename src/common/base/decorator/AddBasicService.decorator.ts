import {Model, MongooseError} from "mongoose";
import {IgnoreReferencesType} from "../../type/ignoreReferences.type";
import {ModelName} from "../../enum/modelName.enum";
import {IBasicService} from "../interface/IBasicService";
import {DeleteOptionsType} from "../type/deleteOptions.type";
import {Discriminator} from "../../enum/discriminator.enum";
import { IGetAllQuery } from "src/common/interface/IGetAllQuery";
import {IResponseShape} from "../../interface/IResponseShape";
import {PostCreateHookFunction, PostHookFunction, PostReadAllHookFunction, PostReadOneHookFunction} from "../../interface/IHookImplementer";

export type ClearCollectionReferences = (_id: any, ignoreReferences?: IgnoreReferencesType) => void | Promise<void>;

/**
 * @deprecated this decorator is going to be removed from use shortly. Please use BasicService class instead
 * @returns 
 */
export const AddBasicService = () => {
    return function<T extends {
        new (...args: any[]): {
            clearCollectionReferences: ClearCollectionReferences;
            refsInModel: ModelName[];
            model: Model<any>;
            modelName?: string;
            discriminators: Discriminator[];
            readAllPostHook?: PostReadAllHookFunction;
            createOnePostHook?: PostCreateHookFunction;
            updateOnePostHook?: PostHookFunction;
            deleteOnePostHook?: PostHookFunction;
            readOnePostHook?: PostReadOneHookFunction;
        }
    }>(originalConstructor: T) {
        return class extends originalConstructor implements IBasicService{
            constructor(...args: any[]) {
                super(...args);
            }

            public createOne = async (input: any): Promise<IResponseShape | MongooseError | null> => {
                const createResp = await this.model.create(input);

                //TODO: add logic if post hook is not successful
                if(this.createOnePostHook)
                    await this.createOnePostHook(input, createResp);

                return this.configureResponse(createResp);
            }

            public readOneById = async (_id: string, includeRefs?: ModelName[], metaData?: string[]): Promise<IResponseShape | null | MongooseError> => {
                const data = includeRefs ? await this.model.findById(_id).populate(includeRefs).exec() : await this.model.findById(_id).exec();
                if(this.readOnePostHook) 
                    this.readOnePostHook(data)
                return data ? this.configureResponse(data) : data;
            }

            public readOneWithCollections = async (_id: string, withQuery: string): Promise<IResponseShape | null | MongooseError> => {
                const withRefs: ModelName[] = withQuery.split('_') as ModelName[];
                const dbQuery = this.model.findById(_id);

                if(withRefs.length === 0){
                    const data = await dbQuery.exec();
                    return data ? this.configureResponse(data) : data;
                }

                for(let i=0; i<withRefs.length; i++){
                    const refModelName = withRefs[i];

                    if(this.refsInModel.includes(refModelName))
                        dbQuery.populate(refModelName);
                }

                const data = await dbQuery.exec();
                return data ? this.configureResponse(data) : data;
            }

            public readOneWithAllCollections = async (_id: string): Promise<IResponseShape | null | MongooseError> => {
                const dbQuery = this.model.findById(_id) as any;

                for(let i=0; i<this.refsInModel.length; i++)
                    dbQuery.populate(this.refsInModel[i]);

                const data = await dbQuery.exec();
                return data ? this.configureResponse(data) : data;
            }

            public readAll = async (query: IGetAllQuery): Promise<IResponseShape | null | MongooseError> => {
                if(query.select === null)
                    return this.configureResponse([]);

                const {filter, select, ...searchOptions} = query;

                const data = await this.model.find(filter, null, searchOptions).select(select);
                if(this.readAllPostHook)
                    await this.readAllPostHook(data);
                return this.configureResponse(data);
            }

            public updateOneById = async (input: any): Promise<object | boolean | MongooseError> => {
                if(!this.updateOnePostHook)
                    return this.model.updateOne({_id: input._id}, input, {rawResult: true});

                const oldDoc = await this.model.findOneAndUpdate({_id: input._id}, input);
                await this.updateOnePostHook(input, oldDoc, {});
                return true;
            }

            public deleteOneById = async (_id: string, ignoreReferences?: IgnoreReferencesType): Promise<Object | null | MongooseError> => {
                const entityToDelete = await this.model.findById(_id);
                if(!entityToDelete)
                    return null;

                await this.clearCollectionReferences(_id, ignoreReferences);
                const result = await this.model.deleteOne({_id});
                if(this.deleteOnePostHook)
                    this.deleteOnePostHook(_id, entityToDelete, result);

                return result;
            }

            public deleteByCondition = async (condition: object, options?: DeleteOptionsType, ignoreReferences?: IgnoreReferencesType): Promise<Object | null | MongooseError> => {
                if(options?.isOne){
                    const entityToDelete = await this.model.findOne(condition);
                    if(!entityToDelete)
                        return null;

                    const _id = entityToDelete._id;
                    await this.clearCollectionReferences(_id, ignoreReferences);
                    const result = this.model.deleteOne({_id: entityToDelete._id});
                    if(this.deleteOnePostHook)
                        this.deleteOnePostHook(_id, entityToDelete, result);

                    return result;
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

            public getModelName = (): string => this.modelName ? this.modelName : 'Model';
            public configureResponse = (data: any): IResponseShape => {
                const modelName = this.getModelName() as ModelName;
                const dataKey = modelName;
                const dataType = Array.isArray(data) ? 'Array' : 'Object';
                const dataCount = dataType === 'Array' ? data.length : 1;

                return {
                    data: {
                        [dataKey]: data
                    },
                    metaData: {
                        dataKey: dataKey,
                        modelName: modelName,
                        dataType,
                        dataCount
                    }
                }
            }
        }

    }
}