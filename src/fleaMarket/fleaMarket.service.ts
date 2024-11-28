import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FleaMarketItem, publicReferences } from "./fleaMarketItem.schema";
import BasicService from "../common/service/basicService/BasicService";
import { ClientSession, Model } from "mongoose";
import {
	TIServiceReadManyOptions,
	TReadByIdOptions,
} from "../common/service/basicService/IService";
import { FleaMarketItemDto } from "./dto/fleaMarketItem.dto";
import { ItemHelperService } from "../clanInventory/item/itemHelper.service";
import { PlayerService } from "../player/player.service";
import { CreateFleaMarketItemDto } from "./dto/createFleaMarketItem.dto";
import { ItemService } from "../clanInventory/item/item.service";
import { Status } from "./enum/status.enum";
import ServiceError from "../common/service/basicService/ServiceError";
import { SEReason } from "../common/service/basicService/SEReason";
import { VotingType } from "../voting/enum/VotingType.enum";
import { VotingService } from "../voting/voting.service";

@Injectable()
export class FleaMarketService {
	constructor(
		@InjectModel(FleaMarketItem.name)
		public readonly model: Model<FleaMarketItem>,
		private readonly itemHelperService: ItemHelperService,
		private readonly playerService: PlayerService,
		private readonly itemService: ItemService,
		private readonly votingService: VotingService
	) {
		this.basicService = new BasicService(model);
	}

	public readonly basicService: BasicService;

	/**
	 * Creates an new Item in DB.
	 *
	 * @param item - The Item data to create.
	 * @returns  created Item or an array of service errors if any occurred.
	 */
	async createOne(item: CreateFleaMarketItemDto) {
		return this.basicService.createOne<
			CreateFleaMarketItemDto,
			FleaMarketItemDto
		>(item);
	}

	/**
	 * Reads an Item by its _id in DB.
	 *
	 * @param _id - The mongo _id of the item to read.
	 * @param options - Options for reading the item.
	 * @returns A promise that resolves into an item with the given _id or array of service errors.
	 */
	async readOneById(_id: string, options?: TReadByIdOptions) {
		let optionsToApply = options;
		if (optionsToApply?.includeRefs)
			optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
				publicReferences.includes(ref)
			);
		return this.basicService.readOneById<FleaMarketItemDto>(
			_id,
			optionsToApply
		);
	}

	/**
	 * Reads multiple items from the database with the given options.
	 *
	 * @param options - Optional settings for the read operation.
	 * @returns A promise that resolves into an array of found objects or service errors.
	 */
	async readMany(options?: TIServiceReadManyOptions) {
		return this.basicService.readMany<FleaMarketItemDto>(options);
	}

	/**
	 * Reads and compares the clan ID of the given player and item.
	 *
	 * @param itemId - The ID of the item.
	 * @param playerId - The ID of the player.
	 * @returns The clan ID if player and item clan_id fields match, or null otherwise.
	 * @throws Will throw if there is an error getting the item or player information.
	 */
	async getClanId(itemId: string, playerId: string) {
		const [itemClanId, itemError] = await this.itemHelperService.getItemClanId(
			itemId
		);
		if (itemError) throw itemError;

		const [player, playerError] = await this.playerService.getPlayerById(
			playerId
		);
		if (playerError) throw playerError;

		return itemClanId === player.clan_id.toString() ? itemClanId : null;
	}

	/**
	 * Handles the process of moving an item to the flea market and starting a voting process.
	 *
	 * @param itemId - The ID of the item to be moved.
	 * @param clanId - The ID of the clan to which the item belongs to.
	 * @param playerId - The ID of the player starting the process.
	 */
	async handleSellItem(itemId: string, clanId: string, playerId: string) {
		const newItem = await this.createFleaMarketItem(itemId, clanId);
		await this.moveItemToFleaMarket(newItem, itemId);
		await this.votingService.startItemVoting({
			playerId,
			itemId,
			clanId,
			type: VotingType.SELLING_ITEM,
		});
	}

	/**
	 * Reads an item from DB and creates a flea market item based on that information.
	 *
	 * @param itemId - The ID of the item to copy information from.
	 * @param clanId - The ID of the clan
	 * @returns A create flea market item dto.
	 * @throws If there is an error reading from db or if the item is not in stock.
	 */
	private async createFleaMarketItem(itemId: string, clanId: string) {
		const [item, itemErrors] = await this.itemService.readOneById(itemId);
		if (itemErrors) throw itemErrors;
		if (!item.stock_id)
			throw new ServiceError({
				reason: SEReason.NOT_ALLOWED,
				message: "Item is not in stock",
			});

		const newFleaMarketItem: CreateFleaMarketItemDto = {
			name: item.name,
			weight: item.weight,
			recycling: item.recycling,
			qualityLevel: item.qualityLevel,
			unityKey: item.unityKey,
			price: item.price,
			isFurniture: item.isFurniture,
			clan_id: clanId,
			status: Status.SHIPPING,
		};

		return newFleaMarketItem;
	}

	/**
	 * Moves an item to the flea market by creating a new flea market item
	 * and deleting the original item.
	 *
	 * @param newItem - The new flea market item to be created.
	 * @param oldItemId - The ID of the original item to be deleted.
	 * @throws Will throw if there is an error reading from DB.
	 */
	private async moveItemToFleaMarket(
		newItem: CreateFleaMarketItemDto,
		oldItemId: string
	) {
		const session: ClientSession = await this.model.db.startSession();
		session.startTransaction();

		const [__, createErrors] = await this.createOne(newItem);
		if (createErrors) await this.cancelTransaction(session, createErrors);

		const [_, deleteErrors] = await this.itemService.deleteOneById(oldItemId);
		if (deleteErrors) await this.cancelTransaction(session, deleteErrors);

		await session.commitTransaction();
		session.endSession();
	}

	/**
	 * Aborts the database transaction and ends the session.
	 *
	 * @param session - Started database session.
	 * @param error - The error to be thrown.
	 * @throws Will throw an unexpected service error.
	 */
	private async cancelTransaction(
		session: ClientSession,
		error: ServiceError[]
	) {
		await session.abortTransaction();
		await session.endSession();
		throw error;
	}
}
