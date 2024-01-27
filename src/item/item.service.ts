import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IBasicService} from "../common/base/interface/IBasicService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {Furniture} from "./item.schema";
import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {IHookImplementer, PostCreateHookFunction, PostHookFunction} from "../common/interface/IHookImplementer";
import {UpdateItemDto} from "./dto/updateItem.dto";
import {CreateItemDto} from "./dto/createItem.dto";

@Injectable()
@AddBasicService()
export class ItemService extends BasicServiceDummyAbstract<Furniture> implements IBasicService<Furniture>, IHookImplementer{
    public constructor(
        @InjectModel(Furniture.name) public readonly model: Model<Furniture>,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.CLAN];
        this.modelName = ModelName.ITEM;
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;

    public createOnePostHook: PostCreateHookFunction = async (input: CreateItemDto, output: Furniture): Promise<boolean> => {
        if(!input?.clan_id)
            return true;

        const isFurnitureCountIncreased = await this.requestHelperService.changeCounterValue(ModelName.CLAN, {_id: input.clan_id}, 'furnitureCount', 1);
        return isFurnitureCountIncreased;
    }

    public updateOnePostHook: PostHookFunction = async (input: Partial<UpdateItemDto>, oldDoc: Furniture, output: Furniture): Promise<boolean> => {
        if(!input?.clan_id)
            return true;

        const changeCounterValue = this.requestHelperService.changeCounterValue;

        //decrease furnitureCount for old clan
        const clanRemoveFrom_id = oldDoc.clan_id;
        if(clanRemoveFrom_id)
            await changeCounterValue(ModelName.CLAN, {_id: clanRemoveFrom_id}, 'furnitureCount', -1);

        const isFurnitureCountIncreased = await changeCounterValue(ModelName.CLAN, {_id: input.clan_id}, 'furnitureCount', 1);
        return isFurnitureCountIncreased;
    }

    public deleteOnePostHook: PostHookFunction = async (input: any, oldDoc: Furniture, output: Furniture): Promise<boolean> => {
        const clan_id = oldDoc.clan_id;

        if(!clan_id)
            return true;

        const isFurnitureCountIncreased = await this.requestHelperService.changeCounterValue(ModelName.CLAN, {_id: clan_id}, 'furnitureCount', -1);
        return isFurnitureCountIncreased;
    }

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
    }
}