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

@Injectable()
@AddBaseService()
export class ClanService extends ServiceDummyAbstract implements IService{
    public constructor(
        @InjectModel(Clan.name) public readonly model: Model<Clan>,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.PLAYER];
    }

    public readonly refsInModel: ModelName[];

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType) => {
        const searchFilter = { clan_id: _id };
        const nullIds = { clan_id: null };

        await this.requestHelperService.nullReferences([
            {modelName: ModelName.PLAYER, filter: searchFilter, nullIds}
        ], ignoreReferences);
    }
}