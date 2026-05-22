import { Injectable } from '@nestjs/common';
import {
  itemProperties,
  ItemProperty,
} from '../clanInventory/item/const/itemProperties';
import { ClanService } from '../clan/clan.service';
import { ModelName } from '../common/enum/modelName.enum';
import { notEnoughCoinsError } from '../fleaMarket/errors/notEnoughCoins.error';
import { VotingService } from '../voting/voting.service';
import { PlayerService } from '../player/player.service';
import { VotingType } from '../voting/enum/VotingType.enum';
import { VotingDto } from '../voting/dto/voting.dto';
import { ItemService } from '../clanInventory/item/item.service';
import { CreateItemDto } from '../clanInventory/item/dto/createItem.dto';
import { VotingQueue } from '../voting/voting.queue';
import { VotingQueueParams } from '../fleaMarket/types/votingQueueParams.type';
import { ItemName } from '../clanInventory/item/enum/itemName.enum';
import { VotingQueueName } from '../voting/enum/VotingQueue.enum';
import { ClientSession, Connection } from 'mongoose';
import { Clan } from '../clan/clan.schema';
import {
  initializeSession,
  cancelTransaction,
  endTransaction,
} from '../common/function/Transactions';
import { InjectConnection } from '@nestjs/mongoose';
import { IServiceReturn } from '../common/service/basicService/IService';

@Injectable()
export class ClanShopService {
  constructor(
    private readonly clanService: ClanService,
    private readonly votingService: VotingService,
    private readonly playerService: PlayerService,
    private readonly itemService: ItemService,
    private readonly votingQueue: VotingQueue,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Handles the process of purchasing an item from shop.
   * This method performs several operations including validating the clan's funds,
   * reserving the required amount, initiating a voting process, and scheduling a voting check job.
   * All operations are executed within a transaction to ensure consistency.
   *
   * @param playerId - The unique identifier of the player attempting to buy the item.
   * @param clanId - The unique identifier of the clan associated with the purchase.
   * @param item - The item being purchased, including its properties such as price.
   * @returns A promise that resolves when the transaction is successfully committed.
   */
  async buyItem(
    playerId: string,
    clanId: string,
    item: ItemProperty,
  ): Promise<IServiceReturn<boolean>> {
    const [session, sessionError] = await initializeSession(this.connection);
    if (sessionError) return [null, sessionError];

    const [clan, clanErrors] = await this.clanService.readOneById(clanId, {
      includeRefs: [ModelName.STOCK],
    });

    if (clanErrors) return cancelTransaction(session, clanErrors);

    if (clan.gameCoins < item.price) {
      return cancelTransaction(session, [notEnoughCoinsError]);
    }

    const [, reserveError] = await this.reserveFunds(
      clan._id,
      item.price,
      session,
    );
    if (reserveError) return cancelTransaction(session, reserveError);

    const [player, playerError] =
      await this.playerService.getPlayerById(playerId);
    if (playerError) return cancelTransaction(session, playerError);

    const [voting, votingErrors] = await this.votingService.startVoting(
      {
        voterPlayer: player,
        type: VotingType.SHOP_BUY_ITEM,
        queue: VotingQueueName.CLAN_SHOP,
        clanId,
        shopItem: item.name,
      },
      session,
    );
    if (votingErrors) return cancelTransaction(session, votingErrors);

    const result = await endTransaction(session, true);

    await this.votingQueue.addVotingCheckJob({
      voting,
      stockId: clan.Stock._id,
      price: item.price,
      queue: VotingQueueName.CLAN_SHOP,
      clanId,
    });

    return result;
  }

  /**
   * Reserves funds from a clan by decrementing the specified price from the clan's gameCoins.
   *
   * @param clanId - The unique identifier of the clan whose funds are to be reserved.
   * @param price - The amount to be deducted from the clan's gameCoins.
   * @param session - mongoose ClientSession for transaction support.
   * @returns A promise with the update result.
   */
  async reserveFunds(clanId: string, price: number, session: ClientSession) {
    return await this.clanService.basicService.updateOneById(
      clanId,
      { $inc: { gameCoins: -price } },
      { session },
    );
  }

  /**
   * Handles the expiration of a voting process by determining its outcome,
   * performing the necessary actions based on the result, and cleaning up
   * the associated voting record.
   *
   * @param data - An object containing the voting details, price, clan ID, and stock ID.
   *
   * The method performs the following steps:
   * 1. Starts a database session and transaction.
   * 2. Checks if the voting process was successful.
   *    - If successful, processes the passed vote and handles any errors.
   *    - If rejected, processes the rejected vote and handles any errors.
   * 3. Commits the transaction and ends the session.
   *
   * If any error occurs during the process, the transaction is canceled, and the session is ended.
   *
   * @returns A promise that resolves to a boolean indicating the success of the operation or an error if any step fails.
   */
  async checkVotingOnExpire(
    data: VotingQueueParams,
  ): Promise<IServiceReturn<boolean>> {
    const { voting, price, clanId, stockId } = data;
    const [session, sessionError] = await initializeSession(this.connection);
    if (sessionError) return [null, sessionError];

    const votePassed = await this.votingService.checkVotingSuccess(voting, true);

    if (votePassed) {
      const [, passedError] = await this.handleVotePassed(
        voting,
        stockId,
        session,
      );
      if (passedError) return cancelTransaction(session, passedError);
    } else {
      const [, rejectError] = await this.handleVoteRejected(
        clanId,
        price,
        session,
      );
      if (rejectError) return cancelTransaction(session, rejectError);
    }

    await this.votingService.finalizeVoting(voting._id);

    return await endTransaction(session, true);
  }

  /**
   * Handles the event when a vote is rejected.
   * Return the reserved coin amount to clan.
   *
   * @param clanId - The unique identifier of the clan.
   * @param price - The amount to increment the clan's game coins by.
   * @param session - mongoose ClientSession for transaction support.
   * @returns A promise that resolves with the result of the update operation.
   */
  private async handleVoteRejected(
    clanId: string,
    price: number,
    session: ClientSession,
  ) {
    return await this.clanService.basicService.updateOneById(
      clanId,
      { $inc: { gameCoins: price } },
      { session },
    );
  }

  /**
   * Handles the event when a vote has passed.
   *
   * This method creates a new item based on the voting details and stock ID,
   * and then delegates the creation to the item service.
   *
   * @param voting - The voting details containing information about the entity.
   * @param stockId - The identifier of the stock associated with the vote.
   * @param session - mongoose ClientSession for transaction support.
   * @returns A promise that resolves to the created item.
   */
  private async handleVotePassed(
    voting: VotingDto,
    stockId: string,
    session: ClientSession,
  ) {
    const newItem = this.getCreateItemDto(voting.shopItemName, stockId);
    return await this.itemService.createOne(newItem, { session });
  }

  /**
   * Creates a new `CreateItemDto` object based on the provided item name and stock ID.
   *
   * @param itemName - The name of the item to retrieve properties for.
   * @param stockId - The unique identifier for the stock to associate with the item.
   * @returns A new `CreateItemDto` object containing the item's properties and additional metadata.
   */
  private getCreateItemDto(itemName: ItemName, stockId: string): CreateItemDto {
    const item = itemProperties[itemName];
    return {
      ...item,
      location: [0, 1],
      unityKey: item.name,
      stock_id: stockId,
      room_id: null,
    };
  }
}
