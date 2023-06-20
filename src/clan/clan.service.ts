import {Injectable} from "@nestjs/common";
import {Model, MongooseError} from "mongoose";
import {Clan} from "./clan.schema";
import {InjectModel} from "@nestjs/mongoose";

@Injectable()
export class ClanService{
    public constructor(@InjectModel(Clan.name) private readonly clanModel: Model<Clan>){
    }

    public create = async (input: any): Promise<Object | MongooseError> => {
        return this.clanModel.create(input);
    }

    public readById = async (_id: string): Promise<Object | null | MongooseError> => {
        return this.clanModel.findById(_id);
    }

    public readAll = async (): Promise<Array<any>> => {
        return this.clanModel.find();
    }

    public updateById = async (input: any): Promise<any> => {
        return this.clanModel.updateOne({_id: input._id}, input, {rawResult: true});
    }

    public deleteById = async (_id: string): Promise<Object | null | MongooseError> => {
        return this.clanModel.deleteOne({_id});
    }
}