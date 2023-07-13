import {Model, MongooseError} from "mongoose";
import {ModelName} from "../../enum/modelName.enum";
import {IConditionService} from "../interface/IConditionService";

export const AddConditionService = () => {
    return function<T extends {
        new (...args: any[]): {
            refsInModel: ModelName[];
            model: Model<any>
        }
    }>(originalConstructor: T) {
        return class extends originalConstructor implements IConditionService{
            constructor(...args: any[]) {
                super(...args);
            }

            public readByCondition = async (condition: {}): Promise<object | null | MongooseError> => {
                return this.model.findById(condition);
            }

            public readOneByConditionWithCollections = async (condition: {}, withQuery: string): Promise<object | null | MongooseError> => {
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

            public readOneByConditionWithAllCollections = async (condition: {}): Promise<object | null | MongooseError> => {
                const dbQuery = this.model.findOne(condition) as any;

                for(let i=0; i<this.refsInModel.length; i++)
                    dbQuery.populate(this.refsInModel[i]);

                return dbQuery.exec();
            }

            public updateByCondition = async (condition: {}, input: any): Promise<object | MongooseError> => {
                return this.model.updateOne(condition, input, {rawResult: true});
            }
        }

    }
}