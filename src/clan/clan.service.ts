import {Injectable} from "@nestjs/common";
import {Model, MongooseError, Types} from "mongoose";
import {Clan} from "./clan.schema";
import {InjectModel} from "@nestjs/mongoose";
import {ClassName} from "../util/dictionary";
import {IgnoreReferencesType} from "../util/type/IIgnoreReferencesType";
import {RequestHelperService} from "../requestHelper/requestHelper.service";

@Injectable()
export class ClanService{
    public constructor(
        @InjectModel(Clan.name) private readonly model: Model<Clan>,
        private readonly requestHelper: RequestHelperService
    ){
    }

    public create = async (input: any): Promise<Object | MongooseError> => {
        return this.model.create(input);
    }

    public readById = async (_id: string): Promise<Object | null | MongooseError> => {
        return this.model.findById(_id);
    }

    public readAll = async (): Promise<Array<any>> => {
        return this.model.find();
    }

    public updateById = async (input: any): Promise<any> => {
        return this.model.updateOne({_id: input._id}, input, {rawResult: true});
    }

    public deleteById = async (_id: string, ignoreReferences?: IgnoreReferencesType): Promise<Object | null | MongooseError> => {
        const entityToDelete = await this.model.findById(_id);
        if(!entityToDelete)
            return null;

        await this.nullCollectionReferences(entityToDelete._id, ignoreReferences);

        return this.model.deleteOne({_id});
    }

    public deleteByCondition = async (condition: object, ignoreReferences?: IgnoreReferencesType) => {
        const entityToDelete = await this.model.findOne(condition);
        if(!entityToDelete)
            return null;

        await this.nullCollectionReferences(entityToDelete._id, ignoreReferences);

        return this.model.deleteOne({_id: entityToDelete._id});
    }

    private nullCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType) => {
        const searchFilter = { clan_id: _id };
        const nullIds = { clan_id: null };

        await this.requestHelper.deleteReferences([
            {modelName: ClassName.PLAYER, filter: searchFilter, nullIds}
        ], ignoreReferences);
    }
}