import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ModelName } from "src/common/enum/modelName.enum";
import { RequestHelperModule } from "src/requestHelper/requestHelper.module";
import { StockModule } from "src/stock/stock.module";
import { ItemShopSchema } from "./itemShop.schema";
import { ItemShopService } from "./itemshop.service";
import { ItemShopController } from "./itemShop.controller";
import { ItemModule } from "src/item/item.module";
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