import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ClanShopService } from './clanShop.service';
import { VotingQueueParams } from '../fleaMarket/types/votingQueueParams.type';
import { VotingQueueName } from '../voting/enum/VotingQueue.enum';

@Processor(VotingQueueName.CLAN_SHOP)
export class ClanShopVotingProcessor extends WorkerHost {
  constructor(private readonly clanShopService: ClanShopService) {
    super();
  }

  /**
   * Processes the job when it is executed.
   * @param job - The job to be processed.
   */
  async process(job: Job<VotingQueueParams>): Promise<any> {
    await this.clanShopService.checkVotingOnExpire(job.data);
  }
}
