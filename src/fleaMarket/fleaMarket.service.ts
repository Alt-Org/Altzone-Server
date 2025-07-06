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
import { cancelTransaction } from '../common/function/cancelTransaction';

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
   * Handles the process of moving an item to the flea market and starting a voting process.
   *
   * @param itemId - The ID of the item to be moved.
   * @param clanId - The ID of the clan to which the item belongs to.
   * @param playerId - The ID of the player starting the process.
   */
  async handleSellItem(
    itemId: string,
    clanId: string,
    playerId: string,
  ): Promise<IServiceReturn<boolean>> {
    const session = await this.connection.startSession();
    session.startTransaction();

    const [item, itemErrors] = await this.itemService.readOneById(itemId);
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
      itemId,
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

    await this.votingQueue.addVotingCheckJob({
      voting,
      fleaMarketItemId: createdItem._id.toString(),
      stockId: item.stock_id.toString(),
      queue: VotingQueueName.FLEA_MARKET,
    });

    await session.commitTransaction();
    await session.endSession();

    return [true, null];
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
    if (voting.type === VotingType.FLEA_MARKET_BUY_ITEM) {
      if (votePassed) {
        await this.handlePassedBuyVoting(voting, stockId);
      } else {
        await this.handleRejectedBuyVoting(voting, clanId, price);
      }
    }

    if (voting.type === VotingType.FLEA_MARKET_SELL_ITEM) {
      if (votePassed) {
        await this.handlePassedSellVoting(fleaMarketItemId);
      } else {
        await this.handleRejectedSellVoting(fleaMarketItemId, stockId);
      }
    }

    await this.votingService.basicService.deleteOneById(voting._id);
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
    if (!session) {
      session = await this.connection.startSession();
      session.startTransaction();
    }

    const [created, createErrors] = await this.createOne(newItem, session);
    if (createErrors) return await cancelTransaction(session, createErrors);

    const [_, deleteErrors] = await this.itemService.deleteOneById(oldItemId);
    if (deleteErrors) return await cancelTransaction(session, deleteErrors);

    await session.commitTransaction();
    session.endSession();

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
    const session = await this.connection.startSession();
    session.startTransaction();

    const [item, itemErrors] =
      await this.basicService.readOneById<FleaMarketItemDto>(
        voting.fleaMarketItem_id,
      );
    if (itemErrors) return await cancelTransaction(session, itemErrors);

    const newItem = await this.helperService.fleaMarketItemToCreateItemDto(
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

    await session.commitTransaction();
    await session.endSession();

    return [true, null];
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
    const session = await this.model.db.startSession();
    session.startTransaction();

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

    await session.commitTransaction();
    await session.endSession();

    return [true, null];
  }

  /**
   * Handles the process when a sell voting has passed.
   *
   * @param itemId - The ID of the item.
   */
  private async handlePassedSellVoting(itemId: string) {
    const [_, errors] = await this.basicService.updateOneById(itemId, {
      status: Status.AVAILABLE,
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

    const session = await this.connection.startSession();
    session.startTransaction();

    const [_, deleteErrors] = await this.basicService.deleteOneById(
      fmItem._id.toString(),
      { session },
    );
    if (deleteErrors) return cancelTransaction(session, deleteErrors);

    const item = await this.helperService.fleaMarketItemToCreateItemDto(
      fmItem,
      stockId,
    );
    const [__, createErrors] = await this.itemService.createOne(item, {
      session,
    });
    if (createErrors) return cancelTransaction(session, createErrors);

    await session.commitTransaction();
    await session.endSession();

    return [true, null];
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
    const session = await this.model.startSession();
    session.startTransaction();

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

    await session.commitTransaction();
    await session.endSession();

    return [voting, null];
  }
}
