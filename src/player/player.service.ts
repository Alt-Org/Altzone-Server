import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Player} from "./player.schema";
import {ClanService} from "../clan/clan.service";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {AddBaseService} from "../common/base/decorator/AddBaseService.decorator";
import {ServiceDummyAbstract} from "../common/base/serviceDummy.abstract";
import {IService} from "../common/base/interface/IService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";

@Injectable()
@AddBaseService()
export class PlayerService extends ServiceDummyAbstract implements IService{
    public constructor(
        @InjectModel(Player.name) public readonly model: Model<Player>,
        private readonly clanService: ClanService,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.CLAN];
    }

    public readonly refsInModel: ModelName[];

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        //await this.clanService.deleteByCondition({player_id: _id}, [ClassName.PLAYER]);
    }
}