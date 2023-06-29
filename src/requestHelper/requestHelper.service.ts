import {Injectable} from "@nestjs/common";
import {InjectConnection} from "@nestjs/mongoose";
import {Connection} from "mongoose";
import {IgnoreReferencesType} from "../util/type/IIgnoreReferencesType";
import {ReferenceToNullType} from "./type/ReferenceToNullType";
import {ClassName} from "../util/dictionary";

@Injectable()
export class RequestHelperService {
    public constructor(@InjectConnection() private connection: Connection) {
    }

    public deleteReferences = async (refs: ReferenceToNullType[], ignore: IgnoreReferencesType = [])=> {
        for(let i=0; i<refs.length; i++){
            const currentRef = refs[i];
            if(!ignore.includes(currentRef.modelName)){
                await this.connection.model(ClassName.PLAYER).updateMany(currentRef.filter, currentRef.nullIds);
            }
        }
    }
}