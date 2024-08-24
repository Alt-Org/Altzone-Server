import {Model, MongooseError} from "mongoose";
import {ModelName} from "../../enum/modelName.enum";
import {IConditionService} from "../interface/IConditionService";
import {Discriminator} from "../../enum/discriminator.enum";

/**
 * @deprecated 
 */
export const AddConditionService = () => {
    return function<T extends {
        new (...args: any[]): {
            refsInModel: ModelName[];
            model: Model<any>;
            discriminators: Discriminator[];
        }
    }>(originalConstructor: T) {
        return class extends originalConstructor implements IConditionService{
            public constructor(...args: any[]) {
                super(...args);
            }

            public readOneByCondition = async (condition: object): Promise<object | null | MongooseError> => {
                return this.model.findOne(condition);
            }

            public readOneByConditionWithCollections = async (condition: object, withQuery: string): Promise<object | null | MongooseError> => {
                const withRefs: ModelName[] = withQuery.split('_') as ModelName[];
                const dbQuery = this.model.findOne(condition);

                if(withRefs.length === 0)
                    return dbQuery;

                for(let i=0; i<withRefs.length; i++){
                    const refModelName = withRefs[i];

                    if(this.refsInModel.includes(refModelName))
                        dbQuery.populate(refModelName);
                }

                return await dbQuery.exec();
            }

            public readOneByConditionWithAllCollections = async (condition: object): Promise<object | null | MongooseError> => {
                const dbQuery = this.model.findOne(condition) as any;

                for(let i=0; i<this.refsInModel.length; i++)
                    dbQuery.populate(this.refsInModel[i]);

                return dbQuery.exec();
            }

            public updateOneByCondition = async (condition: object, input: any): Promise<object | MongooseError> => {
                return this.model.updateOne(condition, input, {rawResult: true});
            }

            public deleteOneByCondition = async (condition: object): Promise<object | MongooseError> => {
                return this.model.deleteOne(condition);
            }
        }
    }
}