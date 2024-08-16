import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ModelName } from "../../common/enum/modelName.enum";
import { RequestHelperModule } from "../../requestHelper/requestHelper.module";
import { ClanVoteSchema } from "./clanVote.schema";
import { ClanVoteController } from "./clanVote.controller";
import { ClanVoteService } from "./clanVote.service";
import { ItemShopModule } from "../itemShop/itemShop.module";
import { ItemShopService } from "../itemShop/itemShop.service";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.CLANVOTE, schema: ClanVoteSchema } ]),
        RequestHelperModule,
        ItemShopModule,
        
    ],
    controllers: [ClanVoteController],
    providers: [ ClanVoteService],
    exports: [ClanVoteService]
})
export class ClanVoteModule {}