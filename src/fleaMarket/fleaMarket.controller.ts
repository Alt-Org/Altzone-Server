import { Controller, Get, Param } from "@nestjs/common";
import { FleaMarketService } from "./fleaMarket.service";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { ModelName } from "../common/enum/modelName.enum";
import { _idDto } from "../common/dto/_id.dto";
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { Serialize } from "../common/interceptor/response/Serialize";
import { FleaMarketItemDto } from "./dto/fleaMarketItem.dto";
import { GetAllQuery } from "../common/decorator/param/GetAllQuery";
import { IGetAllQuery } from "../common/interface/IGetAllQuery";

@Controller("fleaMarket")
export class FleaMarketController {
	constructor(private readonly service: FleaMarketService) {}

	@Get("/:_id")
	@Serialize(FleaMarketItemDto)
	@UniformResponse(ModelName.FLEA_MARKET_ITEM)
	async getOne(@Param() param: _idDto) {
		return await this.service.readOneById(param._id);
	}

	@Get()
	@OffsetPaginate(ModelName.FLEA_MARKET_ITEM)
	@Serialize(FleaMarketItemDto)
	@UniformResponse(ModelName.FLEA_MARKET_ITEM)
	async getAll(@GetAllQuery() query: IGetAllQuery) {
		return await this.service.readMany(query);
	}
}
