import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ModelName } from "../../common/enum/modelName.enum";
import { RequestHelperModule } from "../../requestHelper/requestHelper.module";
import { StockModule } from "../../stock/stock.module";
import { ItemShopSchema } from "./itemShop.schema";
import { ItemShopService } from "./itemShop.service";
import { ItemShopController } from "./itemShop.controller";
import { ItemModule } from "../../item/item.module";
import { ClanVoteModule } from "../clanVote/clanVote.module";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.ITEMSHOP, schema:ItemShopSchema } ]),
        RequestHelperModule,
        ItemModule
    ],
    controllers: [ItemShopController],
    providers: [ ItemShopService],
    exports: [ItemShopService]
})
export class ItemShopModule {}