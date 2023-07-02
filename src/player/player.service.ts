import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Player} from "./player.schema";
import {ClanService} from "../clan/clan.service";
import {ClassName} from "../util/dictionary";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {BaseService} from "../base/base.service";
import {IgnoreReferencesType} from "../util/type/IIgnoreReferencesType";

@Injectable()
export class PlayerService extends BaseService<Player>{
    public constructor(
        @InjectModel(Player.name) public readonly model: Model<Player>,
        private readonly clanService: ClanService,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ClassName.CLAN];
    }

    protected readonly refsInModel: ClassName[];

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        //await this.clanService.deleteByCondition({player_id: _id}, [ClassName.PLAYER]);
    }
}