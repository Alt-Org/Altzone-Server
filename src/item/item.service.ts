import {Injectable} from "@nestjs/common";
import {Model, MongooseError, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IBasicService} from "../common/base/interface/IBasicService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {Item} from "./item.schema";
import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {CreateItemDto} from "./dto/createItem.dto";

@Injectable()
@AddBasicService()
export class ItemService extends BasicServiceDummyAbstract<Item> implements IBasicService<Item>{
    public constructor(
        @InjectModel(Item.name) public readonly model: Model<Item>,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.STOCK];
        this.modelName = ModelName.ITEM;
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;

    public createMany = async (items: CreateItemDto[]): Promise<boolean> => {
        const resp = await this.model.insertMany(items);
        return resp && !(resp instanceof MongooseError);
    }

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
    }
}