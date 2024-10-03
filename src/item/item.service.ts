import {forwardRef, Inject, Injectable} from "@nestjs/common";
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {Item} from "./item.schema";
import {CreateItemDto} from "./dto/createItem.dto";
import {UpdateItemDto} from "./dto/updateItem.dto";
import {ItemDto} from "./dto/item.dto";
import BasicService from "../common/service/basicService/BasicService";
import { TIServiceCreateManyOptions, TIServiceUpdateManyOptions, TReadByIdOptions } from "../common/service/basicService/IService";
import { MoveTo } from "./enum/moveTo.enum";
import { RoomService } from "../room/room.service";
import { PlayerService } from "../player/player.service";
import { NotFoundError } from "./errors/item.errors";
import { ClanService } from "../clan/clan.service";
import ServiceError from "../common/service/basicService/ServiceError";
import { AuthService } from "../auth/auth.service";
import { StealToken } from "./type/stealToken.type";
import { APIErrorReason } from "../common/controller/APIErrorReason";
import { APIError } from "../common/controller/APIError";

@Injectable()
export class ItemService {
	public constructor(
		@InjectModel(Item.name) public readonly model: Model<Item>,
		private readonly authService: AuthService,
		@Inject(forwardRef(() => ClanService)) private readonly clanService: ClanService,
		@Inject(forwardRef(() => RoomService)) private readonly roomService: RoomService,
		@Inject(forwardRef(() => PlayerService)) private readonly playerService: PlayerService,
	){
		this.refsInModel = [ModelName.STOCK];
		this.modelName = ModelName.ITEM;
		this.basicService = new BasicService(model);
	}

	public readonly refsInModel: ModelName[];
	public readonly modelName: ModelName;
	private readonly basicService: BasicService;

	/**
	 * Creates an new Item in DB.
	 *
	 * @param item - The Item data to create.
	 * @returns  created Item or an array of service errors if any occurred.
	 */
	async createOne(item: CreateItemDto) {
		return this.basicService.createOne<CreateItemDto, ItemDto>(item);
	}

	/**
	 * Creates many new Items in DB.
	 *
	 * @param items - The Items data to create.
	 * @returns created Item or an array of service errors if any occurred.
	 */
	async createMany(items: CreateItemDto[]) {
		return this.basicService.createMany<CreateItemDto, ItemDto>(items);
	}

	/**
	 * Creates many new Items in DB.
	 *
	 * @deprecated The createMany() method should be used instead
	 * @param items - The Items data to create.
	 * @returns created Item or an array of service errors if any occurred.
	 */
	async createManyWithResponse(items: CreateItemDto[]) {
		return this.basicService.createMany<CreateItemDto, ItemDto>(items);
	}

	/**
	 * Reads an Item by its _id in DB.
	 *
	 * @param _id - The Mongo _id of the Item to read.
	 * @param options - Options for reading the Item.
	 * @returns Item with the given _id on succeed or an array of ServiceErrors if any occurred.
	 */
	async readOneById(_id: string, options?: TReadByIdOptions) {
		let optionsToApply = options;
		if(options?.includeRefs)
			optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));
		return this.basicService.readOneById<ItemDto>(_id, optionsToApply);
	}

	/**
	 * Reads multiple items from the database based on the provided options.
	 *
	 * @param options - Optional settings for the read operation.
	 * @returns A promise that resolves to a tuple where the first element is an array of ItemDto objects, and the second element is either null or an array of ServiceError objects if something went wrong.
	 */
	async readMany(options?: TIServiceCreateManyOptions) {
		return this.basicService.readMany<ItemDto>(options);
	}

	/**
	 * Updates an Item by its _id in DB. The _id field is read-only and must be found from the parameter
	 *
	 * @param Item - The data needs to be updated for the Item.
	 * @returns _true_ if Item was updated successfully, _false_ if nothing was updated for the Item,
	 * or a ServiceError array if Item was not found or something else went wrong.
	 */
	async updateOneById(Item: UpdateItemDto) {
		const {_id, ...fieldsToUpdate} = Item
		return this.basicService.updateOneById(_id, fieldsToUpdate);
	}

	/**
	 * Updates multiple items in the database.
	 *
	 * @template T - The type of items to update.
	 * @param items - The items to update.
	 * @param options - Optional settings for the update operation.
	 * @returns A promise that resolves to a tuple where the first element is a boolean indicating if the update was successful, and the second element is either null or an array of ServiceError objects if something went wrong.
	 */
	async updateMany<T = any>(items: T[], options?: TIServiceUpdateManyOptions) {
		return this.basicService.updateMany<T>(items, options);
	}

	/**
	 * Deletes an Item by its _id from DB.
	 *
	 * @param _id - The Mongo _id of the Item to delete.
	 * @returns _true_ if Item was removed successfully, or a ServiceError array if the Item was not found or something else went wrong
	 */
	async deleteOneById(_id: string) {
		return this.basicService.deleteOneById(_id);
	}

	/**
	 * Deletes all Items of the specified by _id Stock from DB.
	 *
	 * @param stock_id - The Mongo _id of the Stock from which all items should be deleted
	 * @returns _true_ if Items was removed successfully, or a ServiceError array if any Items of the Stock was not found or something else went wrong
	 */
	async deleteAllStockItems(stock_id: string) {
		return this.basicService.deleteMany({filter: { stock_id }});
	}

	/**
	 * Deletes all Items of the specified by _id Room from DB.
	 *
	 * @param room_id - The Mongo _id of the Stock from which all items should be deleted
	 * @returns _true_ if Items was removed successfully, or a ServiceError array if any Items of the Room was not found or something else went wrong
	 */
	async deleteAllRoomItems(room_id: string) {
		return this.basicService.deleteMany({filter: { room_id }});
	}

	/**
	 * Moves multiple items to a specified stock or room.
	 *
	 * @param itemIds - The IDs of the items to be moved.
	 * @param storageId - The ID of the stock or room to which the items should be moved.
	 * @param storageType - The type of target, either 'stock' or 'room'.
	 * @returns A promise that resolves to a tuple where the first element is a array of successfully moved items, and the second element is an array of ServiceError objects if something went wrong.
	 */
	async moveItems(itemIds: string[], storageId: string, storageType: MoveTo): Promise<[ItemDto[], ServiceError[]]> {
		const [items, itemErrors] = await this.readMany({ filter: { _id: { $in: itemIds } } });
		if (itemErrors) 
			return [null, itemErrors];

		const filter = { _id: { $in: items.map((item) => item._id) } };
		const update =
			storageType === MoveTo.STOCK
				? { $set: { stock_id: storageId, room_id: null } }
				: { $set: { room_id: storageId, stock_id: null } };

		const [_, err] = await this.updateMany([update], { filter });
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
		let playerClanId: string;
		let itemClanId: string;
		let destinationClanId: string;

		const [player, playerErrors] = await this.playerService.getPlayerById(playerId);
		if (playerErrors || !player.clan_id) 
			return [null, [NotFoundError]];

		playerClanId = player.clan_id.toString();

		const [id, errors] = await this.getItemClanId(itemId);
		if (errors) 
			return [null, errors];

		itemClanId = id;

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
	 * Retrieves the clan ID associated with an item.
	 *
	 * @param _id - The ID of the item.
	 * @returns A promise that resolves to a tuple where the first element is the clan ID as a string or null if not found, and the second element is either null or an array of ServiceErrors if something went wrong.
	 */
	private async getItemClanId(_id: string): Promise<[string | null, ServiceError[] | null]> {
		const [item, itemErrors] = await this.readOneById(_id, { includeRefs: [ModelName.STOCK] });
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
	private async getItemSoulHomeId(_id: string) {
		const [item, itemErrors] = await this.readOneById(_id, { includeRefs: [ModelName.ROOM, ModelName.STOCK] });
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
					const soulHomeId = await this.getItemSoulHomeId(itemId);
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
