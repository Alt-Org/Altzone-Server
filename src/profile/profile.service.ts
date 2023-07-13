import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Profile} from "./profile.schema";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IBasicService} from "../common/base/interface/IBasicService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {PlayerService} from "../player/player.service";
import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {AddConditionService} from "../common/base/decorator/AddConditionService.decorator";
import {IConditionService} from "../common/base/interface/IConditionService";
import {BasicAndConditionServiceDummyAbstract} from "../common/base/abstract/basicAndConditionServiceDummy.abstract";

@Injectable()
@AddConditionService()
@AddBasicService()
export class ProfileService extends BasicAndConditionServiceDummyAbstract implements IBasicService, IConditionService{
    public constructor(
        @InjectModel(Profile.name) public readonly model: Model<Profile>,
        private readonly playerService: PlayerService,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.CLAN, ModelName.CUSTOM_CHARACTER, ModelName.RAID_ROOM];
    }

    public readonly refsInModel: ModelName[];

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        await this.playerService.deleteByCondition({profile_id: _id});
    }
}