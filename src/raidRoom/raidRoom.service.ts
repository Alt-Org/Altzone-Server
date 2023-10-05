import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IBasicService} from "../common/base/interface/IBasicService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {RaidRoom} from "./raidRoom.schema";
import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {IHookImplementer, PostCreateHookFunction, PostHookFunction} from "../common/interface/IHookImplementer";
import {UpdateFurnitureDto} from "../furniture/dto/updateFurniture.dto";
import {CreateRaidRoomDto} from "./dto/createRaidRoom.dto";

@Injectable()
@AddBasicService()
export class RaidRoomService extends BasicServiceDummyAbstract<RaidRoom> implements IBasicService<RaidRoom>, IHookImplementer{
    public constructor(
        @InjectModel(RaidRoom.name) public readonly model: Model<RaidRoom>,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.PLAYER, ModelName.CLAN];
    }

    public readonly refsInModel: ModelName[];

    public createOnePostHook: PostCreateHookFunction = async (input: CreateRaidRoomDto, output: RaidRoom): Promise<boolean> => {
        if(!input?.clan_id)
            return true;

        const isRaidRoomCountIncreased = await this.requestHelperService.changeCounterValue(ModelName.CLAN, {_id: input.clan_id}, 'raidRoomCount', 1);
        return isRaidRoomCountIncreased;
    }

    public updateOnePostHook: PostHookFunction = async (input: Partial<UpdateFurnitureDto>, oldDoc: RaidRoom, output: RaidRoom): Promise<boolean> => {
        if(!input?.clan_id)
            return true;

        const changeCounterValue = this.requestHelperService.changeCounterValue;

        const clanRemoveFrom_id = oldDoc.clan_id;
        if(clanRemoveFrom_id)
            await changeCounterValue(ModelName.CLAN, {_id: clanRemoveFrom_id}, 'raidRoomCount', -1);

        const isRaidRoomCountIncreased = await changeCounterValue(ModelName.CLAN, {_id: input.clan_id}, 'raidRoomCount', 1);
        return isRaidRoomCountIncreased;
    }

    public deleteOnePostHook: PostHookFunction = async (input: any, oldDoc: RaidRoom, output: RaidRoom): Promise<boolean> => {
        const clan_id = oldDoc.clan_id;

        if(!clan_id)
            return true;

        const isRaidRoomCountIncreased = await this.requestHelperService.changeCounterValue(ModelName.CLAN, {_id: clan_id}, 'raidRoomCount', -1);
        return isRaidRoomCountIncreased;
    }

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        const searchFilter = { raidRoom_id: _id };
        const nullIds = { raidRoom_id: null };

        await this.requestHelperService.nullReferences([
            {modelName: ModelName.PLAYER, filter: searchFilter, nullIds, isOne: true}
        ], ignoreReferences);
    }
}