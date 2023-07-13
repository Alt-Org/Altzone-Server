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

@Injectable()
@AddBasicService()
export class RaidRoomService extends BasicServiceDummyAbstract implements IBasicService{
    public constructor(
        @InjectModel(RaidRoom.name) public readonly model: Model<RaidRoom>,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.PLAYER, ModelName.CLAN];
    }

    public readonly refsInModel: ModelName[];

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        const searchFilter = { raidRoom_id: _id };
        const nullIds = { raidRoom_id: null };

        await this.requestHelperService.nullReferences([
            {modelName: ModelName.PLAYER, filter: searchFilter, nullIds, isOne: true}
        ], ignoreReferences);
    }
}