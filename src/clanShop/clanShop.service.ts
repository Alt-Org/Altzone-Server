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
   * Uses centralized transaction utilities for consistency.
   */
  async buyItem(
  playerId: string,
  clanId: string,
  item: ItemProperty,
): Promise<IServiceReturn<boolean>> {

    const [session, sessionError] = await initializeSession(this.connection);
    if (sessionError) return [null, sessionError];
    if (!session) return [null, [{ message: 'Could not initialize session' } as any]];

    const [clan, clanErrors] = await this.clanService.readOneById(clanId, {
      includeRefs: [ModelName.STOCK],
      session
    } as any);
    if (clanErrors) return cancelTransaction(session, clanErrors);

    if (clan.gameCoins < item.price) {
      return cancelTransaction(session, [notEnoughCoinsError]);
    }

    const [, reserveError] = await this.reserveFunds(clan._id, item.price, session);
    if (reserveError) return cancelTransaction(session, reserveError);

    const [player, playerError] = await this.playerService.getPlayerById(playerId);
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

    await this.votingQueue.addVotingCheckJob({
    voting,
    stockId: clan.Stock._id,
    price: item.price,
    queue: VotingQueueName.CLAN_SHOP,
    clanId,
    shopItem: item.name,
    });

    // 4. Clean Exit
    return endTransaction(session, true);
}

  /**
   * Reserves funds from a clan by decrementing gameCoins within a session.
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
   * Handles the expiration of a voting process.
   * Ensures that item creation or coin refunds happen atomically.
   */
  async checkVotingOnExpire(
    data: VotingQueueParams,
  ): Promise<IServiceReturn<boolean>> {

    const { voting, price, clanId, stockId } = data;
    const [session, sessionError] = await initializeSession(this.connection);
    
    if (sessionError) return [null, sessionError];
    if (!session) return [null, [{ message: 'Session initialization failed' } as any]];

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
   * Returns the reserved coin amount to the clan.
   */
  private async handleVoteRejected(
    clanId: string,
    price: number,
    session: ClientSession,
  ) {
    return await this.clanService.basicService.updateOneById(
      clanId,
      { $inc: { gameCoins: price } } as any,
      { session },
    );
  }

  /**
   * Creates the purchased item in the clan stock.
   */
  private async handleVotePassed(
    voting: VotingDto,
    stockId: string,
    session: ClientSession,
  ) {
    const newItem = this.getCreateItemDto(voting.shopItemName, stockId);
    return await this.itemService.createOne(newItem, { session } as any);
  }

  /**
   * Helper to map shop items to CreateItemDto.
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
