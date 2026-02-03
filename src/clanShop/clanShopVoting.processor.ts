import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ClanShopService } from './clanShop.service';
import { VotingQueueParams } from '../fleaMarket/types/votingQueueParams.type';
import { VotingQueueName } from '../voting/enum/VotingQueue.enum';
import { Logger } from '@nestjs/common';

@Processor(VotingQueueName.CLAN_SHOP)
export class ClanShopVotingProcessor extends WorkerHost {
  private readonly logger = new Logger(ClanShopVotingProcessor.name);

  constructor(private readonly clanShopService: ClanShopService) {
    super();
  }

  /**
   * Processes the job when it is executed.
   * @param job - The job to be processed.
   */
  async process(job: Job<VotingQueueParams>): Promise<boolean> {
    const [result, error] = await this.clanShopService.checkVotingOnExpire(
      job.data,
    );

    if (error) {
      this.logger.error(
        `ClanShop Voting Job ${job.id} stopped due to an error`,
        JSON.stringify(error),
      );
      return;
    }
  }
}
