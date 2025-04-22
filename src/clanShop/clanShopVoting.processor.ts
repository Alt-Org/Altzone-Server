import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ClanShopService } from './clanShop.service';
import { VotingQueueParams } from '../fleaMarket/types/votingQueueParams.type';
import { VotingQueueName } from '../voting/enum/VotingQueue.enum';

@Processor('voting')
export class ClanShopVotingProcessor extends WorkerHost {
  constructor(private readonly clanShopService: ClanShopService) {
    super();
  }

  /**
   * Processes the job when it is executed.
   * @param job - The job to be processed.
   */
  async process(job: Job<VotingQueueParams>): Promise<any> {
    if (job.name === VotingQueueName.CLAN_SHOP)
      await this.clanShopService.checkVotingOnExpire(job.data);
  }
}
