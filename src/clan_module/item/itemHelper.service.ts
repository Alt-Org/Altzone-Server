import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ItemService } from "./item.service";
import { NotFoundError } from "./errors/item.errors";
import { RoomService } from "../room/room.service";
import { ClanService } from "../clan/clan.service";
import ServiceError from "../../common/service/basicService/ServiceError";
import { ModelName } from "../../common/enum/modelName.enum";

@Injectable()
export class ItemHelperService {
	public constructor(
		@Inject(forwardRef(() => ItemService)) private readonly itemService: ItemService,
		@Inject(forwardRef(() => RoomService)) private readonly roomService: RoomService,
		@Inject(forwardRef(() => ClanService)) private readonly clanService: ClanService,
	){}
	
	/**
	 * Retrieves the clan ID associated with an item.
	 *
	 * @param _id - The ID of the item.
	 * @returns A promise that resolves to a tuple where the first element is the clan ID as a string or null if not found, and the second element is either null or an array of ServiceErrors if something went wrong.
	 */
	async getItemClanId(_id: string): Promise<[string | null, ServiceError[] | null]> {
		const [item, itemErrors] = await this.itemService.readOneById(_id, { includeRefs: [ModelName.STOCK] });
		if (itemErrors) 
			return [null, itemErrors];

		if (item.Stock && item.stock_id && item.Stock.clan_id) 
			return [item.Stock.clan_id.toString(), null];

		if (!item.room_id) 
			return [null, [NotFoundError]];

		const [room, roomErrors] = await this.roomService.readOneById(item.room_id, { includeRefs: [ModelName.SOULHOME] });
		if (roomErrors) 
			return [null, roomErrors];
		
		if (!room["SoulHome"] || !room["SoulHome"].clan_id) 
			return [null, [NotFoundError]];

		return [room["SoulHome"].clan_id, null];
	}

	/**
	 * Retrieves the SoulHome ID associated with an item.
	 *
	 * @param _id - The ID of the item.
	 * @returns - A promise that resolves to the SoulHome ID as a string.
	 * @throws - Throws an error if the item or SoulHome is not found.
	 */
	async getItemSoulHomeId(_id: string) {
		const [item, itemErrors] = await this.itemService.readOneById(_id, { includeRefs: [ModelName.ROOM, ModelName.STOCK] });
		if (itemErrors)
			throw itemErrors;

		if (item.stock_id) {
			const [clan, error] = await this.clanService.readOneById(item.Stock.clan_id.toString(), { includeRefs: [ModelName.SOULHOME] });
			if (error)
				throw NotFoundError;

			return clan.SoulHome._id.toString();
		}

		const [room, roomErrors] = await this.roomService.readOneById(item.room_id, { includeRefs: [ModelName.SOULHOME] });
		if (roomErrors)
			throw roomErrors;

		if (room["SoulHome"])
			return room.soulHome_id.toString();

		throw NotFoundError;
	}

}