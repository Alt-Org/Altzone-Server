import { Injectable } from "@nestjs/common";
import { BasicServiceDummyAbstract } from "src/common/base/abstract/basicServiceDummy.abstract";
import { AddBasicService, ClearCollectionReferences } from "src/common/base/decorator/AddBasicService.decorator";
import { ItemShop } from "./itemShop.schema";
import { IBasicService } from "src/common/base/interface/IBasicService";
import { Model, Types } from "mongoose";
import { IgnoreReferencesType } from "src/common/type/ignoreReferences.type";
import { RequestHelperService } from "src/requestHelper/requestHelper.service";
import { InjectModel } from "@nestjs/mongoose";
import { ModelName } from "src/common/enum/modelName.enum";
import { IHookImplementer, PostReadAllHookFunction, PostReadOneHookFunction } from "src/common/interface/IHookImplementer";
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getTimeSince, passed } from "src/common/function/timeUtils";
@Injectable()
@AddBasicService()
export class ItemShopService extends BasicServiceDummyAbstract<ItemShop> implements IBasicService<ItemShop>, IHookImplementer {
    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    private ITEMPATH = 'src/shop/itemShop/shopItems.json';
    public constructor(
        @InjectModel(ItemShop.name) public readonly model: Model<ItemShop>,
        private readonly requestHelperService: RequestHelperService
    ) {
        super();
        this.refsInModel = [ModelName.ITEM, ModelName.CLANVOTE];
        this.modelName = ModelName.ITEMSHOP;
    }
    public readOnePostHook: PostReadOneHookFunction = async (output: ItemShop): Promise<boolean> => {
        const TWENTYFOURHOURS = 86400000; // 24 hours in millis
        const FIFTEENMINS = 900000;
        const itemListDocument = JSON.parse(
            (await readFile(join(process.cwd(), this.ITEMPATH))).toString('utf-8')
        )
        console.log(itemListDocument);
        console.log(passed(output.lastRestock, FIFTEENMINS));
        if (passed(output.lastRestock, FIFTEENMINS)) {
            await this.restock(output);
        }
        return true;
    }

    public restock = async (shop : ItemShop) => {
        await this.requestHelperService.updateOneById(ModelName.ITEMSHOP, shop._id, {lastRestock: Date.now()}); 
    }
    public clearCollectionReferences: ClearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {

    }
}