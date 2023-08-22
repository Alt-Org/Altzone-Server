import {Injectable} from "@nestjs/common";
import {InjectConnection} from "@nestjs/mongoose";
import {Connection, Types} from "mongoose";
import {ReferenceToNullType} from "./type/ReferenceToNull.type";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {ClassConstructor, plainToInstance} from "class-transformer";

@Injectable()
export class RequestHelperService {
    public constructor(@InjectConnection() private readonly connection: Connection) {
    }

    public getModelInstanceById = async (modelName: ModelName, _id: string | Types.ObjectId, classConstructor: ClassConstructor<any>) => {
        const resp = await this.connection.model(modelName).findById(_id);
        return this.convertRespToInstance(resp, classConstructor);
    }

    public getModelInstanceByCondition = async (modelName: ModelName, condition: object, classConstructor: ClassConstructor<any>, isOne: boolean = false) => {
        if(isOne){
            const resp = await this.connection.model(modelName).findOne(condition);
            return this.convertRespToInstance(resp, classConstructor);
        } else{
            const resp = await this.connection.model(modelName).find(condition);
            return this.convertRespToInstance(resp, classConstructor);
        }
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

    public updateOneById = async (modelName: ModelName, _id: string | Types.ObjectId, updateObject: Object) => {
        return this.connection.model(modelName).updateOne({_id}, updateObject);
    }

    private convertRespToInstance = (resp: any, classConstructor: ClassConstructor<any>) => {
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