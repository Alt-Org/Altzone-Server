import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {Clan} from "./clan.schema";
import {InjectModel} from "@nestjs/mongoose";
import {ClassName} from "../util/dictionary";
import {IgnoreReferencesType} from "../util/type/IIgnoreReferencesType";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {BaseService} from "../base/base.service";

const refsInModel: ClassName[] = [ClassName.PLAYER];

@Injectable()
export class ClanService extends BaseService<Clan>{
    public constructor(
        @InjectModel(Clan.name) private readonly model: Model<Clan>,
        protected readonly requestHelperService: RequestHelperService
    ){
        super();
        console.log(super.setBaseModel);
        // super.setBaseModel(this.model);
        // super.setRefsInModel(refsInModel);
    }

    protected clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType) => {
        const searchFilter = { clan_id: _id };
        const nullIds = { clan_id: null };

        await this.requestHelperService.deleteReferences([
            {modelName: ClassName.PLAYER, filter: searchFilter, nullIds}
        ], ignoreReferences);
    }
}