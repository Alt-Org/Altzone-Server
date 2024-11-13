import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { FleaMarketItemSchema } from "./fleaMarketItem.schema";
import { FleaMarketController } from "./fleaMarket.controller";
import { FleaMarketService } from "./fleaMarket.service";
import { RequestHelperModule } from "../requestHelper/requestHelper.module";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ModelName.FLEA_MARKET_ITEM, schema: FleaMarketItemSchema },
		]),
		RequestHelperModule,
	],
	controllers: [FleaMarketController],
	providers: [FleaMarketService],
	exports: [],
})
export class FleaMarketModule {}
