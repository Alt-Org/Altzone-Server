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
import {
  cancelTransaction,
  endTransaction,
  InitializeSession,
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
   * @param openedSession - An optional MongoDB client session for transaction management
   *
   * @throws Will cancel the transaction and throw errors if:
   * - The clan cannot be retrieved or has insufficient game coins.
   * - Funds cannot be reserved for the purchase.
   * - The player cannot be retrieved.
   * - The voting process cannot be initiated.
   *
   * @returns A promise that resolves when the transaction is successfully committed.
   */
  async buyItem(
    playerId: string,
    clanId: string,
    item: ItemProperty,
    openedSession?: ClientSession,
  ): Promise<IServiceReturn<boolean>> {
    const session = await InitializeSession(this.connection, openedSession);

    const [clan, clanErrors] = await this.clanService.readOneById(clanId, {
      includeRefs: [ModelName.STOCK],
    });
    if (clanErrors)
      return await cancelTransaction(session, clanErrors, openedSession);
    if (clan.gameCoins < item.price)
      return await cancelTransaction(
        session,
        [notEnoughCoinsError],
        openedSession,
      );

    const [, error] = await this.reserveFunds(clan._id, item.price, session);
    if (error) return await cancelTransaction(session, error, openedSession);

    const [player, playerError] =
      await this.playerService.getPlayerById(playerId);
    if (playerError)
      return await cancelTransaction(session, playerError, openedSession);

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
    if (votingErrors) {
      return await cancelTransaction(session, votingErrors, openedSession);
    }

    await this.votingQueue.addVotingCheckJob({
      voting,
      stockId: clan.Stock._id,
      price: item.price,
      queue: VotingQueueName.CLAN_SHOP,
    });

    return endTransaction(session, openedSession);
  }

  /**
   * Reserves funds from a clan by decrementing the specified price from the clan's gameCoins.
   *
   * @param clanId - The unique identifier of the clan whose funds are to be reserved.
   * @param price - The amount to be deducted from the clan's gameCoins.
   * @returns A promise that resolves to the result of the update operation.
   */
  async reserveFunds(clanId: string, price: number, session: ClientSession) {
    return await this.clanService.basicService.updateOneById(
      clanId,
      {
        $inc: { gameCoins: -price },
      },
      { session },
    );
  }

  /**
   * Handles the expiration of a voting process by determining its outcome,
   * performing the necessary actions based on the result, and cleaning up
   * the associated voting record.
   *
   * @param data - An object containing the voting details, price, clan ID, and stock ID.
   * @param openedSession - (Optional) An already opened ClientSession to use
   *
   * The method performs the following steps:
   * 1. Starts a database session and transaction.
   * 2. Checks if the voting process was successful.
   *    - If successful, processes the passed vote and handles any errors.
   *    - If rejected, processes the rejected vote and handles any errors.
   * 3. Deletes the voting record from the database and handles any errors.
   * 4. Commits the transaction and ends the session.
   *
   * If any error occurs during the process, the transaction is canceled, and the session is ended.
   */
  async checkVotingOnExpire(
    data: VotingQueueParams,
    openedSession?: ClientSession,
  ) {
    const { voting, price, clanId, stockId } = data;
    const session = await InitializeSession(this.connection, openedSession);

    const votePassed = await this.votingService.checkVotingSuccess(voting);
    if (votePassed) {
      const [, passedError] = await this.handleVotePassed(voting, stockId);
      if (passedError)
        await cancelTransaction(session, passedError, openedSession);
    } else {
      const [, rejectError] = await this.handleVoteRejected(clanId, price);
      if (rejectError)
        await cancelTransaction(session, rejectError, openedSession);
    }

    await endTransaction(session, openedSession);
  }

  /**
   * Handles the event when a vote is rejected.
   * Return the reserved coin amount to clan.
   *
   * @param clanId - The unique identifier of the clan.
   * @param price - The amount to increment the clan's game coins by.
   * @returns A promise that resolves with the result of the update operation.
   */
  private async handleVoteRejected(clanId, price) {
    return this.clanService.basicService.updateOneById(clanId, {
      $inc: { gameCoins: price },
    });
  }

  /**
   * Handles the event when a vote has passed.
   *
   * This method creates a new item based on the voting details and stock ID,
   * and then delegates the creation to the item service.
   *
   * @param voting - The voting details containing information about the entity.
   * @param stockId - The identifier of the stock associated with the vote.
   * @returns A promise that resolves to the created item.
   */
  private async handleVotePassed(voting: VotingDto, stockId: string) {
    const newItem = this.getCreateItemDto(voting.shopItemName, stockId);
    return await this.itemService.createOne(newItem);
  }

  /**
   * Creates a new `CreateItemDto` object based on the provided item name and stock ID.
   *
   * @param itemName - The name of the item to retrieve properties for.
   * @param stockId - The unique identifier for the stock to associate with the item.
   * @returns A new `CreateItemDto` object containing the item's properties and additional metadata.
   */
  private getCreateItemDto(itemName: ItemName, stockId: string) {
    const item = itemProperties[itemName];
    const newItem: CreateItemDto = {
      ...item,
      location: [0, 1],
      unityKey: item.name,
      stock_id: stockId,
      room_id: null,
    };
    return newItem;
  }
}
