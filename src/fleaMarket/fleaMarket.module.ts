import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { FleaMarketItemSchema } from "./fleaMarketItem.schema";
import { FleaMarketController } from "./fleaMarket.controller";
import { FleaMarketService } from "./fleaMarket.service";
import { RequestHelperModule } from "../requestHelper/requestHelper.module";
import { PlayerModule } from "../player/player.module";
import { ClanInventoryModule } from "../clanInventory/clanInventory.module";
import { VotingModule } from "../voting/voting.module";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ModelName.FLEA_MARKET_ITEM, schema: FleaMarketItemSchema },
		]),
		ClanInventoryModule,
		PlayerModule,
		VotingModule,
		RequestHelperModule,
	],
	controllers: [FleaMarketController],
	providers: [FleaMarketService],
	exports: [],
})
export class FleaMarketModule {}
