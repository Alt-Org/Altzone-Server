import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ModelName } from "src/common/enum/modelName.enum";
import { RequestHelperModule } from "src/requestHelper/requestHelper.module";
import { StockModule } from "src/stock/stock.module";
import { ClanVoteSchema } from "./clanVote.schema";
import { ClanVoteController } from "./clanVote.controller";
import { ClanVoteService } from "./clanVote.service";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.CLANVOTE, schema: ClanVoteSchema } ]),
        RequestHelperModule
    ],
    controllers: [ClanVoteController],
    providers: [ ClanVoteService],
    exports: [ClanVoteService]
})
export class ClanVoteModule {}