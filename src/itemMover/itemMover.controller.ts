import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ItemMoverService } from "./itemMover.service";
import { User } from "../auth/user";
import { StealToken } from "../clanInventory/item/decorator/param/StealToken.decorator";
import { MoveItemDto } from "../clanInventory/item/dto/moveItem.dto";
import { StealItemsDto } from "../clanInventory/item/dto/stealItems.dto";
import { IdMismatchError } from "../clanInventory/item/errors/playerId.errors";
import { StealTokenGuard } from "../clanInventory/item/guards/StealToken.guard";
import { LoggedUser } from "../common/decorator/param/LoggedUser.decorator";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { _idDto } from "../common/dto/_id.dto";
import { ModelName } from "../common/enum/modelName.enum";
import { StealToken as stealToken } from "../clanInventory/item/type/stealToken.type";

@Controller("item")
export class ItemMoverController {
	public constructor(
		private readonly itemMoverService: ItemMoverService,
	) {}

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
