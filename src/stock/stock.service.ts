import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IBasicService} from "../common/base/interface/IBasicService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {Stock} from "./stock.schema";
import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {IHookImplementer, PostCreateHookFunction, PostHookFunction} from "../common/interface/IHookImplementer";
import {CreateStockDto} from "./dto/createStock.dto";
import {UpdateStockDto} from "./dto/updateStock.dto";

@Injectable()
@AddBasicService()
export class StockService extends BasicServiceDummyAbstract<Stock> implements IBasicService<Stock>, IHookImplementer{
    public constructor(
        @InjectModel(Stock.name) public readonly model: Model<Stock>,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.CLAN, ModelName.ITEM];
        this.modelName = ModelName.STOCK;
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;

    public createOnePostHook: PostCreateHookFunction = async (input: CreateStockDto, output: Stock): Promise<boolean> => {
        if(!input?.clan_id)
            return true;

        const isRaidRoomCountIncreased = await this.requestHelperService.changeCounterValue(ModelName.CLAN, {_id: input.clan_id}, 'stockCount', 1);
        return isRaidRoomCountIncreased;
    }

    public updateOnePostHook: PostHookFunction = async (input: Partial<UpdateStockDto>, oldDoc: Stock, output: Stock): Promise<boolean> => {
        if(!input?.clan_id)
            return true;

        const changeCounterValue = this.requestHelperService.changeCounterValue;

        const clanRemoveFrom_id = oldDoc.clan_id;
        if(clanRemoveFrom_id)
            await changeCounterValue(ModelName.CLAN, {_id: clanRemoveFrom_id}, 'stockCount', -1);

        const isRaidRoomCountIncreased = await changeCounterValue(ModelName.CLAN, {_id: input.clan_id}, 'stockCount', 1);
        return isRaidRoomCountIncreased;
    }

    public deleteOnePostHook: PostHookFunction = async (input: any, oldDoc: Stock, output: Stock): Promise<boolean> => {
        const clan_id = oldDoc.clan_id;

        if(!clan_id)
            return true;

        const isRaidRoomCountIncreased = await this.requestHelperService.changeCounterValue(ModelName.CLAN, {_id: clan_id}, 'stockCount', -1);
        return isRaidRoomCountIncreased;
    }

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
    }
}