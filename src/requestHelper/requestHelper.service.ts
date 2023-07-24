import {Injectable} from "@nestjs/common";
import {InjectConnection} from "@nestjs/mongoose";
import {Connection} from "mongoose";
import {ReferenceToNullType} from "./type/ReferenceToNull.type";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {ObjectId} from "mongodb";
import {ClassConstructor, plainToInstance} from "class-transformer";

@Injectable()
export class RequestHelperService {
    public constructor(@InjectConnection() private connection: Connection) {
    }

    public getModelInstanceById = async (modelName: ModelName, _id: string | ObjectId, classConstructor: ClassConstructor<any>) => {
        const resp = await this.connection.model(modelName).findById(_id);
        return plainToInstance(classConstructor, resp._doc);
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
}