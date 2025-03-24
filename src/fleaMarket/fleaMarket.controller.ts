import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { FleaMarketService } from "./fleaMarket.service";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { ModelName } from "../common/enum/modelName.enum";
import { _idDto } from "../common/dto/_id.dto";
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { Serialize } from "../common/interceptor/response/Serialize";
import { FleaMarketItemDto } from "./dto/fleaMarketItem.dto";
import { GetAllQuery } from "../common/decorator/param/GetAllQuery";
import { IGetAllQuery } from "../common/interface/IGetAllQuery";
import { LoggedUser } from "../common/decorator/param/LoggedUser.decorator";
import { User } from "../auth/user";
import { APIError } from "../common/controller/APIError";
import { APIErrorReason } from "../common/controller/APIErrorReason";
import { PlayerService } from "../player/player.service";
import { ItemIdDto } from "./dto/itemId.dto";

@Controller("fleaMarket")
export class FleaMarketController {
	constructor(
		private readonly service: FleaMarketService,
		private readonly playerService: PlayerService,
	) {}

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

	@Post("sell")
	@UniformResponse()
	async sell(@Body() itemIdDto: ItemIdDto, @LoggedUser() user: User) {
		const clanId = await this.service.getClanId(
			itemIdDto.item_id,
			user.player_id
		);

		if (!clanId)
			throw new APIError({
				reason: APIErrorReason.NOT_AUTHORIZED,
				message: "The item does not belong to the clan of logged in player",
			});

		await this.service.handleSellItem(
			itemIdDto.item_id,
			clanId,
			user.player_id
		);
	}

	@Post("buy")
	@UniformResponse()
	async buy(@Body() itemIdDto: ItemIdDto, @LoggedUser() user: User) {
		await this.playerService.readOneById(user.player_id);

		const clanId = await this.playerService.getPlayerClanId(user.player_id);
		if (!clanId)
			throw new APIError({
				reason: APIErrorReason.NOT_AUTHORIZED,
				message: "Player must be a member of a clan to buy items"
			});

		await this.service.handleBuyItem(clanId, itemIdDto.item_id, user.player_id);
	}
}
