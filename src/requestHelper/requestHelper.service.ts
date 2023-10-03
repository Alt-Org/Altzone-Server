import {Injectable} from "@nestjs/common";
import {InjectConnection} from "@nestjs/mongoose";
import {Connection, QueryOptions, Types} from "mongoose";
import {ReferenceToNullType} from "./type/ReferenceToNull.type";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {ClassConstructor, plainToInstance} from "class-transformer";

@Injectable()
export class RequestHelperService {
    public constructor(@InjectConnection() private readonly connection: Connection) {
    }

    public getModelInstanceById = async <T=any>(modelName: ModelName, _id: string | Types.ObjectId, classConstructor: ClassConstructor<T>): Promise<T> | null => {
        const isValid_id = Types.ObjectId.isValid(_id);
        if(!isValid_id){
            return null;
        }
        const resp = await this.connection.model(modelName).findById(_id);
        return this.convertRespToInstance(resp, classConstructor);
    }

    public async getModelInstanceByCondition <T=any>(
        modelName: ModelName,
        condition: object,
        classConstructor: ClassConstructor<T>,
        isOne: true
    ): Promise<T> | null;
    public async getModelInstanceByCondition <T=any>(
        modelName: ModelName,
        condition: object,
        classConstructor: ClassConstructor<T>,
        isOne?: false
    ): Promise<T[]> | null;
    public async getModelInstanceByCondition <T=any>(
        modelName: ModelName,
        condition: object,
        classConstructor: ClassConstructor<T>,
        isOne: boolean = false
    ): Promise<T | T[]> | null {
        let resp;
        if(isOne)
            resp = await this.connection.model(modelName).findOne(condition);
        else
            resp = await this.connection.model(modelName).find(condition);

        return resp ? this.convertRespToInstance(resp, classConstructor) : null;
    }

    public findOneRaw = async (modelName: ModelName, filter: object = {}, options?: QueryOptions) => {
        return this.connection.model(modelName).findOne(filter, null, options);
    }

    public count = async (modelName: ModelName, filter: object = {}): Promise<number> => {
        if(filter && Object.keys(filter).length === 0)
            return this.connection.model(modelName).estimatedDocumentCount();

        return this.connection.model(modelName).countDocuments(filter);
    }

    public nullReferences = async (refs: ReferenceToNullType[], ignore: IgnoreReferencesType = [])=> {
        for(let i=0; i<refs.length; i++){
            const currentRef = refs[i];
            if(!ignore.includes(currentRef.modelName)){
                if(currentRef.isOne)
                    await this.connection.model(currentRef.modelName).updateOne(currentRef.filter, currentRef.nullIds);
                else
                    await this.connection.model(currentRef.modelName).updateMany(currentRef.filter, currentRef.nullIds);
            }
        }
    }

    public changeCounterValue = async (modelName: ModelName, filter: object, counterField: string, counterChange: number): Promise<boolean> => {
        if(counterChange === 0)
            return true;

        const model = this.connection.model(modelName);

        const docToUpdate = await model.findOne(filter);
        if(!docToUpdate)
            return false;

        const currentCount = docToUpdate[counterField];
        if(currentCount == null)
            return false;

        const newCount = currentCount + counterChange;
        if(newCount < 0)
            return false;

        const updateResponse = await model.updateOne({_id: docToUpdate._id}, {[counterField]: newCount});
        const isCountModified = updateResponse.modifiedCount !== 0;
        return isCountModified;
    }

    public updateOneById = async (modelName: ModelName, _id: string | Types.ObjectId, updateObject: Object) => {
        return this.connection.model(modelName).updateOne({_id}, updateObject);
    }

    private convertRespToInstance = (resp: any, classConstructor: ClassConstructor<any>): any => {
        if(resp){
            if(!Array.isArray(resp)){
                return this.convertMongoRespToInstance(resp, classConstructor);
            } else {
                const result: any[] = [];
                for(let i=0; i<resp.length; i++){
                    const instance = this.convertMongoRespToInstance(resp[i], classConstructor);
                    result.push(instance);
                }
                return result;
            }
        }

        return null;
    }

    private convertMongoRespToInstance = (resp: any, classConstructor: ClassConstructor<any>) => {
        if(resp && resp._doc){
            const instance = plainToInstance(classConstructor, resp._doc);

            for(const key in instance){
                if(instance[key] && instance[key] instanceof Types.ObjectId)
                    instance[key] = instance[key].toString();
            }

            return instance;
        }
        return null;
    }
}