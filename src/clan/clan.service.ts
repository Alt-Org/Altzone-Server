import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {Clan} from "./clan.schema";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {RaidRoomService} from "../raidRoom/raidRoom.service";
import {
    AddBasicService,
    ClearCollectionReferences,
} from "../common/base/decorator/AddBasicService.decorator";
import {IBasicService} from "../common/base/interface/IBasicService";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {ItemService} from "../item/item.service";

@Injectable()
@AddBasicService()
export class ClanService extends BasicServiceDummyAbstract<Clan> implements IBasicService<Clan>{
    public constructor(
        @InjectModel(Clan.name) public readonly model: Model<Clan>,
        private readonly raidRoomService: RaidRoomService,
        private readonly itemService: ItemService,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.PLAYER, ModelName.RAID_ROOM, ModelName.ITEM];
        this.modelName = ModelName.CLAN;
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;

    public clearCollectionReferences: ClearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        const searchFilter = { clan_id: _id };
        const nullIds = { clan_id: null };

        await this.requestHelperService.nullReferences([
            {modelName: ModelName.PLAYER, filter: searchFilter, nullIds}
        ], ignoreReferences);

        await this.raidRoomService.deleteByCondition(searchFilter);
        await this.itemService.deleteByCondition(searchFilter);
    }
}