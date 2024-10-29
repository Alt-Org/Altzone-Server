import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ItemService } from "./item.service";
import { ItemHelperService } from "./itemHelper.service";
import { ItemDto } from "./dto/item.dto";
import { MoveTo } from "./enum/moveTo.enum";
import { NotFoundError } from "./errors/item.errors";
import { StealToken } from "./type/stealToken.type";
import { RoomService } from "../room/room.service";
import { ClanService } from "../../clan/clan.service";
import { APIError } from "../../common/controller/APIError";
import { APIErrorReason } from "../../common/controller/APIErrorReason";
import { ModelName } from "../../common/enum/modelName.enum";
import ServiceError from "../../common/service/basicService/ServiceError";
import { PlayerService } from "../../player/player.service";

@Injectable()
export class ItemMoverService {
	public constructor(
		@Inject(forwardRef(() => ItemService)) private readonly itemService: ItemService,
		@Inject(forwardRef(() => ItemHelperService)) private readonly itemHelperService: ItemHelperService,
		@Inject(forwardRef(() => PlayerService)) private readonly playerService: PlayerService,
		@Inject(forwardRef(() => ClanService)) private readonly clanService: ClanService,
		@Inject(forwardRef(() => RoomService)) private readonly roomService: RoomService,
	){}


	/**
	 * Moves multiple items to a specified stock or room.
	 *
	 * @param itemIds - The IDs of the items to be moved.
	 * @param storageId - The ID of the stock or room to which the items should be moved.
	 * @param storageType - The type of target, either 'stock' or 'room'.
	 * @returns A promise that resolves to a tuple where the first element is a array of successfully moved items, and the second element is an array of ServiceError objects if something went wrong.
	 */
	async moveItems(itemIds: string[], storageId: string, storageType: MoveTo): Promise<[ItemDto[], ServiceError[]]> {
		const [items, itemErrors] = await this.itemService.readMany({ filter: { _id: { $in: itemIds } } });
		if (itemErrors) 
			return [null, itemErrors];

		const filter = { _id: { $in: items.map((item) => item._id) } };
		const update =
			storageType === MoveTo.STOCK
				? { $set: { stock_id: storageId, room_id: null } }
				: { $set: { room_id: storageId, stock_id: null } };

		const [_, err] = await this.itemService.updateMany([update], { filter });
		if (err)
			return [null, err]
		
		return [items, null]
	}

	/**
	 * Moves a single item to a specified destination if player, destination and item are in same clan.
	 *
	 * @param itemId - The ID of the item to be moved.
	 * @param destinationId - The ID of the destination (Room or Stock).
	 * @param moveTo - The type of target, either 'Stock' or 'Room'.
	 * @param playerId - The ID of the player performing the move.
	 * @returns A promise that resolves to a tuple where the first element is the moved item, and the second element an array of ServiceError objects if something went wrong.
	 */
	async moveItem(itemId: string, destinationId: string, moveTo: MoveTo, playerId: string): Promise<[ItemDto[], ServiceError[]]> {
		let destinationClanId: string;

		const [player, playerErrors] = await this.playerService.getPlayerById(playerId);
		if (playerErrors || !player.clan_id) 
			return [null, [NotFoundError]];

		const playerClanId = player.clan_id.toString();

		const [id, errors] = await this.itemHelperService.getItemClanId(itemId);
		if (errors) 
			return [null, errors];

		const itemClanId = id;

		if (moveTo === MoveTo.ROOM) {
			const [room, roomErrors] = await this.roomService.readOneById(destinationId, { includeRefs: [ModelName.SOULHOME] });
			if (roomErrors) 
				return [null, roomErrors];

			destinationClanId = room['SoulHome'].clan_id;
		} else {
			destinationClanId = player.clan_id.toString();
			const [clan, clanErrors] = await this.clanService.readOneById(destinationClanId, { includeRefs: [ModelName.STOCK]});
			if (clanErrors)
				return [null, clanErrors];

			destinationId = clan.Stock._id.toString();
		}

		if (playerClanId !== itemClanId || playerClanId !== destinationClanId)
			return [null, [NotFoundError]];

		return this.moveItems([itemId], destinationId, moveTo);
	}

	/**
	 * Steal items from another clan.
	 * Finds the SoulHome ids of provided items and validates the ids with stealToken
	 * and then moves all the valid items to the provided room.
	 * 
	 * @param itemIds - IDs of the items to be stolen.
	 * @param stealToken - Decoded JWT for authorizing steal actions.
	 * @param roomId - ID of the room to move the stolen items to.
	 * @returns - A promise that resolves into array of stolen items.
	 * @throws - Throws an error if no movable items are found.
	 */
	async stealItems(itemIds: string[], stealToken: StealToken, roomId: string) {
		const itemSoulHomeIds: { itemId: string; soulHomeId: string }[] =
			await Promise.all(
				itemIds.map(async (itemId) => {
					const soulHomeId = await this.itemHelperService.getItemSoulHomeId(itemId);
					return { itemId, soulHomeId };
				})
			);

		const filteredItems = itemSoulHomeIds.filter((item) => item.soulHomeId === stealToken.soulHomeId);
		if (filteredItems.length === 0)
			throw new APIError({ reason: APIErrorReason.NOT_FOUND, message: "No movable items found" });

		const filteredItemIds = filteredItems.map((item) => item.itemId);
		return this.moveItems(filteredItemIds, roomId, MoveTo.ROOM);
	}
}