import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { VotingQueueParams } from '../fleaMarket/types/votingQueueParams.type';
import { VotingQueueName } from './enum/VotingQueue.enum';

@Injectable()
export class VotingQueue {
  constructor(
    @InjectQueue(VotingQueueName.CLAN_ROLE)
    private readonly clanRoleQueue: Queue,
    @InjectQueue(VotingQueueName.CLAN_SHOP)
    private readonly clanShopQueue: Queue,
    @InjectQueue(VotingQueueName.FLEA_MARKET)
    private readonly fleaMarketQueue: Queue,
  ) {}

  /**
   * Adds a voting check job to the appropriate queue with a delay based on the voting's scheduled end time.
   *
   * @param params - The parameters for the voting check job, including voting details, queue type, and optional item IDs.
   * @throws Error if the queue type is unknown.
   */
  async addVotingCheckJob(params: VotingQueueParams) {
    const delay = params.voting.endsOn.getTime() - Date.now();

    switch (params.queue) {
      case VotingQueueName.CLAN_ROLE:
        await this.clanRoleQueue.add(params.queue, params, { delay });
        break;
      case VotingQueueName.CLAN_SHOP:
        await this.clanShopQueue.add(params.queue, params, { delay });
        break;
      case VotingQueueName.FLEA_MARKET:
        await this.fleaMarketQueue.add(params.queue, params, { delay });
        break;
      default:
        throw new Error(`Unknown queue: ${params.queue}`);
    }
  }
}
