import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {Clan} from "./clan.schema";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {AddBaseService} from "../common/base/decorator/AddBaseService.decorator";
import {ServiceDummyAbstract} from "../common/base/serviceDummy.abstract";
import {IService} from "../common/base/interface/IService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {RaidRoomService} from "../raidRoom/raidRoom.service";
import {FurnitureService} from "../furniture/furniture.service";

@Injectable()
@AddBaseService()
export class ClanService extends ServiceDummyAbstract implements IService{
    public constructor(
        @InjectModel(Clan.name) public readonly model: Model<Clan>,
        private readonly raidRoomService: RaidRoomService,
        private readonly furnitureService: FurnitureService,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.PLAYER, ModelName.RAID_ROOM, ModelName.FURNITURE];
    }

    public readonly refsInModel: ModelName[];

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        const searchFilter = { clan_id: _id };
        const nullIds = { clan_id: null };

        await this.requestHelperService.nullReferences([
            {modelName: ModelName.PLAYER, filter: searchFilter, nullIds}
        ], ignoreReferences);

        await this.raidRoomService.deleteByCondition(searchFilter);
        await this.furnitureService.deleteByCondition(searchFilter);
    }
}