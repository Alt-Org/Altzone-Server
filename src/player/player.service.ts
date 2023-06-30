import {Injectable} from "@nestjs/common";
import {Model, MongooseError} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Player} from "./player.schema";
import {ClanService} from "../clan/clan.service";
import {ClassName} from "../util/dictionary";
import {RequestHelperService} from "../requestHelper/requestHelper.service";

@Injectable()
export class PlayerService{
    public constructor(
        @InjectModel(Player.name) private readonly playerModel: Model<Player>,
        private readonly clanService: ClanService,
        private readonly requestHelperService: RequestHelperService
    ){
    }

    private readonly refsInModel: ClassName[] = [ClassName.CLAN];

    public create = async (input: any): Promise<Object | MongooseError> => {
        return this.playerModel.create(input);
    }

    public readById = async (_id: string): Promise<Object | null | MongooseError> => {
        return this.playerModel.findById(_id);
    }

    public readOneWithCollections = async (_id: string, withQuery: string) => {
        const withRefs: ClassName[] = withQuery.split('_') as ClassName[];
        return this.requestHelperService.getEntityWithReferences(ClassName.CLAN, _id, withRefs, this.refsInModel);
    }

    public readOneWithAllCollections = async (_id: string) => {
        return await this.requestHelperService.getEntityWithAllCollections(ClassName.PLAYER, _id, this.refsInModel);
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