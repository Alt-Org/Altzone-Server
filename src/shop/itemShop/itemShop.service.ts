import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { BasicServiceDummyAbstract } from "../../common/base/abstract/basicServiceDummy.abstract";
import { AddBasicService, ClearCollectionReferences } from "../../common/base/decorator/AddBasicService.decorator";
import { ItemShop, ItemShopDocument, ShopItem } from "./itemShop.schema";
import { IBasicService } from "../../common/base/interface/IBasicService";
import { Document, Model, MongooseError, Types } from "mongoose";
import { IgnoreReferencesType } from "../../common/type/ignoreReferences.type";
import { RequestHelperService } from "../../requestHelper/requestHelper.service";
import { InjectModel } from "@nestjs/mongoose";
import { ModelName } from "../../common/enum/modelName.enum";
import { IHookImplementer, PostReadAllHookFunction, PostReadOneHookFunction } from "../../common/interface/IHookImplementer";
import { getTimeSince, passed } from "../../common/function/timeUtils";
import { ItemService } from "../../item/item.service";
import { getDefaultItemsNotInStock } from "../../clan/defaultValues/items";
import { CreateItemDto } from "../../item/dto/createItem.dto";
import { CreateShopItemDTO } from "./dto/createShopItem.dto";
import { CreateShopDto } from "./dto/createItemshop.dto";
import { ShopItemDTO } from "./dto/shopItem.dto";
@Injectable()
@AddBasicService()
export class ItemShopService extends BasicServiceDummyAbstract<ItemShop> implements IBasicService<ItemShop>, IHookImplementer {
    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    public constructor(
        @InjectModel(ItemShop.name) public readonly model: Model<ItemShop>,
        private readonly requestHelperService: RequestHelperService,
        private readonly itemService: ItemService
    ) {
        super();
        this.refsInModel = [ModelName.ITEM, ModelName.CLANVOTE];
        this.modelName = ModelName.ITEMSHOP;
        this.defaultDocument();
    }
    private defaultDocument = async () => { // creates default item shop on init
        if (!(await this.model.findOne({ name: "Huonekalukauppa" }) instanceof Document)) {
            let shopDto: CreateShopDto = {
                name: "Huonekalukauppa"
            };
            const resp = await this.createOne(shopDto);
            if (resp instanceof MongooseError)
                throw new InternalServerErrorException("Could not create default itemshop");
            this.restock(resp.data.ItemShop);
        }
    }
    public readOnePostHook: PostReadOneHookFunction = async (output: ItemShop): Promise<boolean> => {
        const TWENTYFOURHOURS = 86400000; // 24 hours in millis
        if (output.name == "Huonekalukauppa") {
            if (passed(output.lastRestock, TWENTYFOURHOURS)) {
                await this.restock(output);
            }
        }
        return true;
    }

    private restock = async (shop: ItemShop) => {
        await this.requestHelperService.updateOneById(ModelName.ITEMSHOP, shop._id, { lastRestock: Date.now() });
        const items: CreateItemDto[] = getDefaultItemsNotInStock();
        // const itemResp = await this.itemService.createManyWithResponse(items)
        // if (itemResp instanceof MongooseError) 
        //     throw new InternalServerErrorException("Could not create items");
        // const shopDocument = await this.getShopOrThrowNotFoundError(shop._id);
        // const tempArray = [];
        // shopDocument.items.forEach(e => {
        //     if (e.isInVoting) {
        //         tempArray.push(e);
        //     } else if(!e.isSold){
        //         this.itemService.deleteOneById(e.item_id);
        //     }
        // });
        // shopDocument.items = tempArray;
        // itemResp.forEach(p => {
        //     let item: CreateShopItemDTO = {
        //         item_id: p._id.toString(),
        //         isInVoting: false,
        //         isSold: false,
        //         vote_id:undefined
        //     };
        //     shopDocument.items.push(item);
        // });
        // shopDocument.markModified("items");
        // const resp = await shopDocument.save();
        // if (!resp || !(resp instanceof Document))
        //     throw new InternalServerErrorException('Could not save the message');

    }
    public clearCollectionReferences: ClearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {

    }
    private getShopOrThrowNotFoundError = async (_id: string): Promise<ItemShopDocument> => {
        const shop = await this.model.findById(_id);

        if (!shop || !(shop instanceof Document))
            throw new NotFoundException(`Shop with _id ${_id} not found`);

        return shop;
    }
}