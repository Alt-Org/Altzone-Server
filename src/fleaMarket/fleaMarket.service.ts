import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { FleaMarketItem, publicReferences } from './fleaMarketItem.schema';
import BasicService from '../common/service/basicService/BasicService';
import { ClientSession, Connection, Model } from 'mongoose';
import {
  IServiceReturn,
  TIServiceReadManyOptions,
  TReadByIdOptions,
} from '../common/service/basicService/IService';
import { FleaMarketItemDto } from './dto/fleaMarketItem.dto';
import { ItemHelperService } from '../clanInventory/item/itemHelper.service';
import { PlayerService } from '../player/player.service';
import { CreateFleaMarketItemDto } from './dto/createFleaMarketItem.dto';
import { ItemService } from '../clanInventory/item/item.service';
import { Status } from './enum/status.enum';
import { VotingType } from '../voting/enum/VotingType.enum';
import { ClanService } from '../clan/clan.service';
import { VotingDto } from '../voting/dto/voting.dto';
import { notEnoughCoinsError } from './errors/notEnoughCoins.error';
import { itemNotAvailableError } from './errors/itemNotAvailable.error';
import { ClanDto } from '../clan/dto/clan.dto';
import { VotingQueueParams } from './types/votingQueueParams.type';
import { ModelName } from '../common/enum/modelName.enum';
import { itemNotInStockError } from './errors/itemNotInStock.error';
import { FleaMarketHelperService } from './fleaMarketHelper.service';
import { VotingService } from '../voting/voting.service';
import { PlayerDto } from '../player/dto/player.dto';
import { VotingQueue } from '../voting/voting.queue';
import { VotingQueueName } from '../voting/enum/VotingQueue.enum';
import { cancelTransaction, endTransaction, InitializeSession } from '../common/function/Transactions';
import { SellFleaMarketItemDto } from './dto/sellFleaMarketItem.dto';
import { itemNotAuthorizedError } from './errors/itemNotAuthorized.error';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { maxSlotsReachedError } from './errors/maxSlotsReached.error';
import { ItemBookedError } from './errors/itemBooked.error';
import { CreateItemDto } from '../clanInventory/item/dto/createItem.dto';

@Injectable()
export class FleaMarketService {
  constructor(
    @InjectModel(FleaMarketItem.name)
    public readonly model: Model<FleaMarketItem>,
    private readonly helperService: FleaMarketHelperService,
    private readonly itemHelperService: ItemHelperService,
    private readonly playerService: PlayerService,
    private readonly itemService: ItemService,
    private readonly votingService: VotingService,
    private readonly votingQueue: VotingQueue,
    private readonly clanService: ClanService,
    @InjectConnection() private readonly connection: Connection,
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
  async createOne(item: CreateFleaMarketItemDto, session?: ClientSession) {
    return this.basicService.createOne<
      CreateFleaMarketItemDto,
      FleaMarketItemDto
    >(item, { session });
  }
  /**
   * Reads an Item by its _id in DB.
   *
   * @param _id - The mongo _id of the item to read.
   * @param options - Options for reading the item.
   * @returns A promise that resolves into an item with the given _id or array of service errors.
   */
  async readOneById(_id: string, options?: TReadByIdOptions) {
    const optionsToApply = options;
    if (optionsToApply?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        publicReferences.includes(ref),
      );
    return this.basicService.readOneById<FleaMarketItemDto>(
      _id,
      optionsToApply,
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
    const [itemClanId, itemError] =
      await this.itemHelperService.getItemClanId(itemId);
    if (itemError) throw itemError;

    const [player, playerError] =
      await this.playerService.getPlayerById(playerId);
    if (playerError) throw playerError;

    return itemClanId === player.clan_id.toString() ? itemClanId : null;
  }

  /**
   * Reads and compares the clan ID of the given player and flea market item.
   *
   * @param itemId - The ID of the flea market item.
   * @param playerId - The ID of the player.
   * @returns The clan ID if player and item clan_id fields match, or null otherwise.
   * @throws Will throw if there is an error getting the item or player information.
   */
  async getFleaMarketItemClanId(itemId: string, playerId: string) {
    const [item, itemError] =
      await this.basicService.readOneById<FleaMarketItem>(itemId);
    if (itemError) throw itemError;

    const [player, playerError] =
      await this.playerService.getPlayerById(playerId);
    if (playerError) throw playerError;

    return item.clan_id.toString() === player.clan_id.toString()
      ? item.clan_id.toString()
      : null;
  }

  /**
   * Handles the process of moving an item to the flea market and starting a voting process.
   *
   * @param sellFleaMarketItemDto - The Dto of the item to be moved.
   * @param clanId - The ID of the clan to which the item belongs to.
   * @param playerId - The ID of the player starting the process.
   */
  async handleSellItem(
    sellFleaMarketItemDto: SellFleaMarketItemDto,
    clanId: string,
    playerId: string,
  ): Promise<IServiceReturn<boolean>> {
    const session = await InitializeSession(this.connection);

    const [item, itemErrors] = await this.itemService.readOneById(
      sellFleaMarketItemDto.item_id,
    );
    if (itemErrors) return await cancelTransaction(session, itemErrors);
    if (!item.stock_id)
      return await cancelTransaction(session, [itemNotInStockError]);

    const [player, playerErrors] =
      await this.playerService.getPlayerById(playerId);
    if (playerErrors) return await cancelTransaction(session, playerErrors);

    const newItem = await this.helperService.itemToCreateFleaMarketItem(
      item,
      clanId,
    );
    const [createdItem, err] = await this.moveItemToFleaMarket(
      newItem,
      sellFleaMarketItemDto.item_id,
      session,
    );
    if (err) return await cancelTransaction(session, err);

    const [voting, errors] = await this.votingService.startVoting({
      voterPlayer: player,
      type: VotingType.FLEA_MARKET_SELL_ITEM,
      clanId,
      fleaMarketItem: createdItem,
      queue: VotingQueueName.FLEA_MARKET,
    });
    if (errors) return await cancelTransaction(session, errors);

    const [, votingUpdateErrors] =
      await this.votingService.basicService.updateOneById(
        voting._id,
        { price: sellFleaMarketItemDto.price },
        { session },
      );
    if (votingUpdateErrors)
      return cancelTransaction(session, votingUpdateErrors);

    await this.votingQueue.addVotingCheckJob({
      voting,
      fleaMarketItemId: createdItem._id.toString(),
      stockId: item.stock_id.toString(),
      queue: VotingQueueName.FLEA_MARKET,
      price: sellFleaMarketItemDto.price,
    });

    return await endTransaction(session);
  }

  /**
   * Handles the process of starting a buy item voting.
   *
   * @param clanId - The ID of the clan.
   * @param itemId - The ID of the item.
   * @param playerId - The ID of the player.
   *
   * @throws Will throw a service error if item is not available
   * or if the clan doesn't have enough coins for the item.
   */
  async handleBuyItem(
    clanId: string,
    itemId: string,
    playerId: string,
  ): Promise<IServiceReturn<boolean>> {
    const [clan, clanErrors] = await this.clanService.readOneById(clanId, {
      includeRefs: [ModelName.STOCK],
    });
    if (clanErrors) return [false, clanErrors];

    const [item, itemErrors] = await this.readOneById(itemId);
    if (itemErrors) return [false, itemErrors];

    if (item.status !== Status.AVAILABLE)
      return [false, [itemNotAvailableError]];
    if (clan.gameCoins < item.price) return [false, [notEnoughCoinsError]];

    const [player, playerErrors] =
      await this.playerService.getPlayerById(playerId);
    if (playerErrors) return [false, playerErrors];

    const [voting, err] = await this.handleBooking(clan, item, player);
    if (err) return [false, err];
    this.votingQueue.addVotingCheckJob({
      voting,
      clanId,
      price: item.price,
      stockId: clan.Stock?._id.toString(),
      queue: VotingQueueName.FLEA_MARKET,
    });

    return [true, null];
  }

  /**
   * Handles the voting when it expires.
   *
   * @param params - Information about the voting.
   * @param params.voting - The voting that expired.
   * @param params.price - The price of the item voted on.
   * @param params.clanId - The ID of the clan.
   * @param params.stockId - The ID of the stock.
   * @param params.fleaMarketItemId - The ID of the flea market item.
   */
  async checkVotingOnExpire(params: VotingQueueParams) {
    const { voting, price, clanId, stockId, fleaMarketItemId } = params;

    const votePassed = await this.votingService.checkVotingSuccess(voting);

    switch (voting.type) {
      case VotingType.FLEA_MARKET_BUY_ITEM:
        if (votePassed) await this.handlePassedBuyVoting(voting, stockId);
        else await this.handleRejectedBuyVoting(voting, clanId, price);
        break;
      case VotingType.FLEA_MARKET_SELL_ITEM:
        if (votePassed)
          await this.handlePassedSellVoting(fleaMarketItemId, price);
        else await this.handleRejectedSellVoting(fleaMarketItemId, stockId);
        break;
      case VotingType.FLEA_MARKET_CHANGE_ITEM_PRICE:
        if (votePassed)
          await this.handlePassedItemPriceChangeVoting(
            voting.fleaMarketItem_id.toString(),
            voting.price,
          );
        else
          await this.handleRejectedItemPriceChangeVoting(
            voting.fleaMarketItem_id,
          );
        break;
    }
  }

  /**
   * Moves an item to the flea market by creating a new flea market item
   * and deleting the original item.
   *
   * @param newItem - The new flea market item to be created.
   * @param oldItemId - The ID of the original item to be deleted.
   *
   * @returns The the created flea market item.
   *
   * @throws Will throw if there is an error reading from DB.
   */
  private async moveItemToFleaMarket(
    newItem: CreateFleaMarketItemDto,
    oldItemId: string,
    session?: ClientSession,
  ): Promise<IServiceReturn<FleaMarketItemDto>> {
    const [created, createErrors] = await this.createOne(newItem, session);
    if (createErrors) return [null, createErrors];

    const [_, deleteErrors] = await this.itemService.deleteOneById(oldItemId);
    if (deleteErrors) return [null, createErrors];

    return [created, null];
  }

  /**
   * Handles the process when a buy voting has passed
   *
   * @param voting - The voting data.
   * @param stockId - The stock ID to associate with the new item.
   *
   * @throws Will throw if there is an error with the database transaction.
   */
  private async handlePassedBuyVoting(
    voting: VotingDto,
    stockId: string,
  ): Promise<IServiceReturn<boolean>> {
    const session = await InitializeSession(this.connection);

    const [item, itemErrors] =
      await this.basicService.readOneById<FleaMarketItemDto>(
        voting.fleaMarketItem_id,
      );
    if (itemErrors) return await cancelTransaction(session, itemErrors);

    const newItem = this.helperService.fleaMarketItemToCreateItemDto(
      item,
      stockId,
    );

    const [_, itemCreateErrors] = await this.itemService.createOne(newItem);
    if (itemCreateErrors) {
      return await cancelTransaction(session, itemCreateErrors);
    }

    const [__, itemDeleteErrors] = await this.basicService.deleteOneById(
      voting.fleaMarketItem_id,
    );
    if (itemDeleteErrors)
      return await cancelTransaction(session, itemDeleteErrors);

    return await endTransaction(session);
  }

  /**
   * Handles the process when a buy voting has been rejected.
   *
   * @param voting - The voting data.
   * @param clanId - The ID of the clan.
   * @param itemPrice - The price of the item.
   *
   * @throws Will throw if there is an error with the database transaction.
   */
  private async handleRejectedBuyVoting(
    voting: VotingDto,
    clanId: string,
    itemPrice: number,
  ): Promise<IServiceReturn<boolean>> {
    const session = await InitializeSession(this.model.db);

    const [_, updateErrors] = await this.basicService.updateOneById(
      voting.fleaMarketItem_id,
      { status: Status.AVAILABLE },
    );
    if (updateErrors) return await cancelTransaction(session, updateErrors);

    const [clan, clanErrors] = await this.clanService.readOneById(clanId);
    if (clanErrors) return await cancelTransaction(session, clanErrors);

    const [__, clanUpdateErrors] = await this.clanService.updateOne(
      { gameCoins: clan.gameCoins + itemPrice },
      { filter: { _id: clanId } },
    );
    if (clanUpdateErrors)
      return await cancelTransaction(session, clanUpdateErrors);

    return await endTransaction(session);
  }

  /**
   * Handles the process when a sell voting has passed.
   *
   * @param itemId - The ID of the item.
   * @param sellingPrice - The price for which item should be sold
   */
  private async handlePassedSellVoting(itemId: string, sellingPrice: number) {
    const [_, errors] = await this.basicService.updateOneById(itemId, {
      status: Status.SHIPPING,
      price: sellingPrice,
    });
    if (errors) throw errors;
  }

  /**
   * Handles the process when a sell voting has been rejected.
   *
   * Deletes the flea market item and creates an item based on it's info
   * and the provided stockId.
   *
   * @param fmItemId - The ID of flea market item.
   * @param stockId - The ID of the stock.
   *
   * @throws Will throw if there is an error with the database transaction.
   */
  private async handleRejectedSellVoting(
    fmItemId: string,
    stockId: string,
  ): Promise<IServiceReturn<boolean>> {
    const [fmItem, fmItemErrors] =
      await this.basicService.readOneById(fmItemId);
    if (fmItemErrors) throw fmItemErrors;

    const session = await InitializeSession(this.connection);

    const [_, deleteErrors] = await this.basicService.deleteOneById(
      fmItem._id.toString(),
      { session },
    );
    if (deleteErrors) return cancelTransaction(session, deleteErrors);

    const item = this.helperService.fleaMarketItemToCreateItemDto(
      fmItem,
      stockId,
    );
    const [__, createErrors] = await this.itemService.createOne(item, {
      session,
    });
    if (createErrors) return cancelTransaction(session, createErrors);

    return await endTransaction(session);
  }

  /**
   * Changes the status of a FleaMarketItem.
   *
   * @param item - The FleaMarketItemDto to update.
   * @param status - The new status to set for the item.
   * @param session - The current database session.
   *
   * @throws Will throw an error if there is an issue with the database transaction.
   */
  private async changeItemStatus(
    item: FleaMarketItemDto,
    status: Status,
    session: ClientSession,
  ): Promise<IServiceReturn<boolean>> {
    item.status = status;
    return await this.basicService.updateOne(item, {
      filter: { _id: item._id },
      session,
    });
  }

  /**
   * Reserves funds by deducting the specified amount from the clan's gameCoins.
   *
   * @param clan - The ClanDto representing the clan whose funds are to be reserved.
   * @param amount - The amount to be reserved.
   * @param session - The current database session.
   *
   * @throws Will throw an error if there is an issue with the database transaction.
   */
  private async reserveFunds(
    clan: ClanDto,
    amount: number,
    session: ClientSession,
  ): Promise<IServiceReturn<boolean>> {
    clan.gameCoins -= amount;
    return await this.clanService.updateOne(clan, {
      filter: { _id: clan._id },
      session,
    });
  }

  /**
   * Reserves funds by deducting the specified amount from the clan's gameCoins.
   *
   * @param clan - The ClanDto representing the clan whose funds are to be reserved.
   * @param amount - The amount to be reserved.
   * @param session - The current database session.
   *
   * @throws Will throw an error if there is an issue with the database transaction.
   */
  private async handleBooking(
    clan: ClanDto,
    item: FleaMarketItemDto,
    player: PlayerDto,
  ): Promise<IServiceReturn<VotingDto>> {
    const session = await InitializeSession(this.model.db);

    const [, itemChangeErr] = await this.changeItemStatus(
      item,
      Status.BOOKED,
      session,
    );
    if (itemChangeErr) return await cancelTransaction(session, itemChangeErr);
    const [, fundReserveError] = await this.reserveFunds(
      clan,
      item.price,
      session,
    );
    if (fundReserveError)
      return await cancelTransaction(session, fundReserveError);

    const [voting, createVotingErrors] = await this.votingService.startVoting({
      clanId: clan._id.toString(),
      fleaMarketItem: item,
      voterPlayer: player,
      type: VotingType.FLEA_MARKET_BUY_ITEM,
      queue: VotingQueueName.FLEA_MARKET,
    });
    if (createVotingErrors)
      return await cancelTransaction(session, createVotingErrors);

    await endTransaction(session);

    return [voting, null];
  }

  /**
   * Handles starting a voting to change a price of a flea market item.
   *
   * validates that there is no ongoing voting about the item
   * updates the item status to shipping so it's unavailable to be bought while price change voting is ongoing
   * starts a new voting and adds it to the voting queue
   *
   * @param item_id - _id of the item whose price to change
   * @param price - the new price for the item
   * @param player_id - _id of the player starting the voting
   *
   * @returns VotingDto or ServiceErrors
   **/
  async changeItemPrice(
    item_id: string,
    price: number,
    player_id: string,
  ): Promise<IServiceReturn<VotingDto>> {
    const [player, playerErrors] =
      await this.playerService.getPlayerById(player_id);
    if (playerErrors) return [null, playerErrors];

    const [item, itemErrors] =
      await this.basicService.readOneById<FleaMarketItemDto>(item_id);
    if (itemErrors) return [null, itemErrors];
    if (item.status !== Status.AVAILABLE)
      return [null, [itemNotAvailableError]];
    if (item.clan_id.toString() !== player.clan_id.toString())
      return [null, [itemNotAuthorizedError]];

    const session = await InitializeSession(this.connection);

    const [_, updateErrors] = await this.basicService.updateOneById(
      item._id,
      { status: Status.SHIPPING },
      { session },
    );
    if (updateErrors) return await cancelTransaction(session, updateErrors);

    const [voting, votingErrors] = await this.votingService.startVoting(
      {
        voterPlayer: player,
        type: VotingType.FLEA_MARKET_CHANGE_ITEM_PRICE,
        queue: VotingQueueName.CLAN_SHOP,
        clanId: player.clan_id?.toString(),
        newItemPrice: price,
        fleaMarketItem: item,
      },
      session,
    );
    if (votingErrors) return await cancelTransaction(session, votingErrors);

    await this.votingQueue.addVotingCheckJob({
      voting,
      queue: VotingQueueName.FLEA_MARKET,
    });

    await endTransaction(session);

    return [voting, null];
  }

  /**
   * Handles passed item price change voting by updating the status and price of the item
   *
   * @param item_id - _id of the item to update
   * @param newPrice - new price of the item
   **/
  private async handlePassedItemPriceChangeVoting(
    item_id: string,
    newPrice: number,
  ) {
    await this.basicService.updateOneById(item_id, {
      status: Status.AVAILABLE,
      price: newPrice,
    });
  }

  /**
   * Handles rejected item price change voting by changing the item status back to available.
   *
   * @param item_id - _id of the item to update
   **/
  private async handleRejectedItemPriceChangeVoting(item_id: string) {
    await this.basicService.updateOneById(item_id, {
      status: Status.AVAILABLE,
    });
  }

  /**
   * Check if clan has available slots for items.
   *
   * Validates that clan stall max slots is bigger than the amount of items
   * clan has for sale in the flea market.
   **/
  async checkClanItemSlots(clan_id: string): Promise<IServiceReturn<boolean>> {
    const [clan, clanError] = await this.clanService.readOneById(clan_id);
    if (clanError) return [false, clanError];
    if (!clan.stall)
      return [
        false,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            message: "Clan doesn't have a stall.",
          }),
        ],
      ];

    const [items, itemError] =
      await this.basicService.readMany<FleaMarketItemDto>({
        filter: {
          clan_id,
          status: { $in: [Status.AVAILABLE, Status.BOOKED] },
        },
      });
    if (itemError) return [false, itemError];

    if (items.length >= clan.stall.maxSlots)
      return [false, [maxSlotsReachedError]];

    return [true, null];
  }

  /**
   * Moves a flea market item to the clan's stock.
   *
   * This method performs the following steps:
   * 1. Reads the flea market item by its ID.
   * 2. Returns an error if the item is booked or if there are read errors.
   * 3. Reads the clan by its ID, including its stock reference.
   * 4. Converts the flea market item to a DTO suitable for stock creation.
   * 5. Executes a transaction to move the item to stock.
   *
   * @param itemId - The ID of the flea market item to move.
   * @param clanId - The ID of the clan whose stock will receive the item.
   * @returns A promise resolving to the result of the move operation or errors encountered.
   */
  async moveFleaMarketItemToStock(itemId: string, clanId: string) {
    const [item, errors] =
      await this.basicService.readOneById<FleaMarketItem>(itemId);

    if (errors) return [null, errors];
    if (item.status === Status.BOOKED) return [null, [ItemBookedError]];

    const [clan, clanErrors] = await this.clanService.readOneById(clanId, {
      includeRefs: [ModelName.STOCK],
    });
    if (clanErrors) return [null, clanErrors];

    const createItemDto = this.helperService.fleaMarketItemToCreateItemDto(
      item,
      clan.Stock._id,
    );

    return await this.moveFleaMarketItemToStockTransaction(
      createItemDto,
      itemId,
    );
  }

  /**
   * Moves an item from the flea market to stock within a database transaction.
   *
   * This method performs the following steps in a transaction:
   * 1. Creates a new item in stock using the provided item data.
   * 2. Deletes the corresponding item from the flea market by its ID.
   * 3. Commits the transaction if both operations succeed.
   * 4. Cancels the transaction and returns errors if any operation fails.
   *
   * @param itemDto - Data transfer object containing the item details to be created in stock.
   * @param fleaMarketItemId - The ID of the flea market item to be removed.
   * @returns A tuple where the first element indicates success and the second contains any errors.
   */
  private async moveFleaMarketItemToStockTransaction(
    itemDto: CreateItemDto,
    fleaMarketItemId: string,
  ) {
    const session = await InitializeSession(this.connection);

    const [, createErrors] = await this.itemService.createOne(itemDto, {
      session,
    });
    if (createErrors) return await cancelTransaction(session, createErrors);

    const [, deleteErrors] = await this.basicService.deleteOneById(
      fleaMarketItemId,
      { session },
    );

    if (deleteErrors) return await cancelTransaction(session, deleteErrors);

    return await endTransaction(session);
  }
}
