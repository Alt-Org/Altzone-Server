import { Injectable, Logger } from '@nestjs/common';
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
import { ClientSession, Connection, UpdateQuery } from 'mongoose';
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
  private readonly logger = new Logger(ClanShopService.name);

  constructor(
    private readonly clanService: ClanService,
    private readonly votingService: VotingService,
    private readonly playerService: PlayerService,
    private readonly itemService: ItemService,
    private readonly votingQueue: VotingQueue,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Handles the process of purchasing an item from the shop.
   * Initializes a transaction, reserves clan funds, and starts a voting process.
   * * @param playerId - The ID of the player initiating the purchase.
   * @param clanId - The ID of the clan the player belongs to.
   * @param item - The properties of the item being purchased.
   * @returns A promise resolving to an IServiceReturn indicating success or containing errors.
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
   * Reserves funds from a clan by decrementing gameCoins.
   * * @param clanId - The ID of the clan.
   * @param price - The amount to deduct.
   * @param session - The active database session for the transaction.
   * @returns A promise with the update result.
   */
  async reserveFunds(clanId: string, price: number, session: ClientSession) {
    return await this.clanService.basicService.updateOneById(
      clanId,
      {
        $inc: { gameCoins: -price },
      } as UpdateQuery<Clan>,
      { session },
    );
  }

  /**
   * Processes the result of a finished vote when the queue job expires.
   * * @param data - The parameters passed from the background job.
   * @returns A promise resolving to an IServiceReturn.
   */
  async checkVotingOnExpire(
    data: VotingQueueParams,
  ): Promise<IServiceReturn<boolean>> {
    const { voting, price, clanId, stockId } = data;
    const [session, sessionError] = await initializeSession(this.connection);
    if (sessionError) return [null, sessionError];

    const votePassed = await this.votingService.checkVotingSuccess(voting);

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

    return endTransaction(session, true);
  }

  /**
   * Returns the reserved coin amount to the clan if a vote fails.
   * * @param clanId - The ID of the clan.
   * @param price - The amount to return.
   * @param session - The active database session.
   */
  private async handleVoteRejected(
    clanId: string,
    price: number,
    session: ClientSession,
  ) {
    return await this.clanService.basicService.updateOneById(
      clanId,
      { $inc: { gameCoins: price } } as UpdateQuery<Clan>,
      { session },
    );
  }

  /**
   * Finalizes the purchase by creating the item in the clan stock.
   * * @param voting - The voting record containing item details.
   * @param stockId - The ID of the stock where the item will be placed.
   * @param session - The active database session.
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
   * Helper to map shop items to a CreateItemDto for the ItemService.
   * * @param itemName - The name of the item.
   * @param stockId - The ID of the destination stock.
   * @returns A populated CreateItemDto.
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
