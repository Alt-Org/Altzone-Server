import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ItemService } from "./item.service";
import { ItemDto } from "./dto/item.dto";
import { MoveItemDto } from "./dto/moveItem.dto";
import { StealTokenGuard } from "./guards/StealToken.guard";
import { StealToken } from "./decorator/param/StealToken.decorator";
import { StealToken as stealToken } from "./type/stealToken.type";
import { SoulHomeService } from "../soulhome/soulhome.service";
import { IdMismatchError } from "./errors/playerId.errors";
import { SoulHomeDto } from "../soulhome/dto/soulhome.dto";
import { StealItemsDto } from "./dto/stealItems.dto";
import { ItemMoverService } from "./itemMover.service";
import { Authorize } from "../../authorization/decorator/Authorize";
import { Action } from "../../authorization/enum/action.enum";
import { UniformResponse } from "../../common/decorator/response/UniformResponse";
import { ModelName } from "../../common/enum/modelName.enum";
import { LoggedUser } from "../../common/decorator/param/LoggedUser.decorator";
import { User } from "../../auth/user";
import { _idDto } from "../../common/dto/_id.dto";

@Controller("item")
export class ItemController {
	public constructor(
		private readonly itemService: ItemService,
		private readonly itemMoverService: ItemMoverService,
		private readonly soulHomeService: SoulHomeService,
	) {}

	@Get("steal")
	@Authorize({ action: Action.read, subject: SoulHomeDto })
	@UseGuards(StealTokenGuard)
	@UniformResponse(ModelName.SOULHOME)
	public async getSoulHome(@StealToken() stealToken: stealToken, @LoggedUser() user: User) {
		if (stealToken.playerId !== user.player_id) 
			throw IdMismatchError;

		return await this.soulHomeService.readOneById(stealToken.soulHomeId, { includeRefs: [ModelName.ROOM] });
	}

	@Get("/:_id")
	@Authorize({ action: Action.read, subject: ItemDto })
	@UniformResponse(ModelName.ITEM)
	public get(@Param() param: _idDto) {
		return this.itemService.readOneById(param._id);
	}

	@Post("/move")
	@UniformResponse()
	public async moveItems(@Body() body: MoveItemDto, @LoggedUser() user: User) {
		const [_, errors] = await this.itemMoverService.moveItem(body.item_id, body.destination_id, body.moveTo, user.player_id);
		if (errors)
			return errors;
	}

	@Post("steal")
	@UseGuards(StealTokenGuard)
	@UniformResponse(ModelName.ITEM)
	public async stealItems(@Body() body: StealItemsDto, @StealToken() stealToken: stealToken, @LoggedUser() user: User) {
		if (user.player_id !== stealToken.playerId)
			throw IdMismatchError

		return await this.itemMoverService.stealItems(body.item_ids, stealToken, body.room_id);
	}
}
