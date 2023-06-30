import {Injectable} from "@nestjs/common";
import {InjectConnection} from "@nestjs/mongoose";
import {Connection, MongooseError, Types} from "mongoose";
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
                await this.connection.model(currentRef.modelName).updateMany(currentRef.filter, currentRef.nullIds);
            }
        }
    }

    public getEntityWithReferences = async (modelName: ClassName, _id: string | Types.ObjectId, withRefs: ClassName[], refsInModel: ClassName[]) => {
        const dbQuery = this.connection.model(modelName).findById(_id);

        if(withRefs.length === 0)
            return dbQuery;

        for(let i=0; i<withRefs.length; i++){
            const refModelName = withRefs[i];

            if(refsInModel.includes(refModelName))
                dbQuery.populate(refModelName);
        }
        const dbQueryResp = await dbQuery.exec() as any;
        if(dbQueryResp === null || dbQueryResp._doc === null)
            return null;

        return {...dbQueryResp._doc, ...dbQueryResp.$$populatedVirtuals};
    }

    public getEntityWithAllCollections = async (modelName: ClassName, _id: string | Types.ObjectId, refsInModel: ClassName[]): Promise<Object | null | MongooseError> => {
        const dbQuery = this.connection.model(modelName).findById(_id) as any;

        for(let i=0; i<refsInModel.length; i++)
            dbQuery.populate(refsInModel[i]);


        const dbQueryResp = await dbQuery.exec() as any;
        if(dbQueryResp === null || dbQueryResp._doc === null)
            return null;

        return {...dbQueryResp._doc, ...dbQueryResp.$$populatedVirtuals};
    }
}