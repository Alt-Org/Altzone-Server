import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {Clan} from "./clan.schema";
import {InjectModel} from "@nestjs/mongoose";
import {ClassName} from "../util/dictionary";
import {IgnoreReferencesType} from "../util/type/IIgnoreReferencesType";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IService} from "../base/interface/IService";
import {ServiceDummyAbstract} from "../base/serviceDummy.abstract";
import {AddBaseService} from "../base/decorator/AddBaseService.decorator";

@Injectable()
@AddBaseService()
export class ClanService extends ServiceDummyAbstract implements IService{
    public constructor(
        @InjectModel(Clan.name) public readonly model: Model<Clan>,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ClassName.PLAYER];
    }

    public readonly refsInModel: ClassName[];

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType) => {
        const searchFilter = { clan_id: _id };
        const nullIds = { clan_id: null };

        await this.requestHelperService.nullReferences([
            {modelName: ClassName.PLAYER, filter: searchFilter, nullIds}
        ], ignoreReferences);
    }
}