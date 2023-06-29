import {Injectable} from "@nestjs/common";
import {Model, MongooseError} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Player} from "./player.schema";
import {ClanService} from "../clan/clan.service";
import {ClassName} from "../util/dictionary";

@Injectable()
export class PlayerService{
    public constructor(
        @InjectModel(Player.name) private readonly playerModel: Model<Player>,
        private readonly clanService: ClanService
    ){
    }

    public create = async (input: any): Promise<Object | MongooseError> => {
        return this.playerModel.create(input);
    }

    public readById = async (_id: string): Promise<Object | null | MongooseError> => {
        return this.playerModel.findById(_id);
    }

    public readAll = async (): Promise<Array<any>> => {
        return this.playerModel.find();
    }

    public updateById = async (input: any): Promise<any> => {
        return this.playerModel.updateOne({_id: input._id}, input, {rawResult: true});
    }

    public deleteById = async (_id: string): Promise<Object | null | MongooseError> => {
        await this.clanService.deleteByCondition({player_id: _id}, [ClassName.PLAYER]);

        return this.playerModel.deleteOne({_id});
    }
}