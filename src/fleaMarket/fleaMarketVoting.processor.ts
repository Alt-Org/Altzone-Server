import { Processor, WorkerHost } from '@nestjs/bullmq';
import { FleaMarketService } from './fleaMarket.service';
import { VotingQueueParams } from './types/votingQueueParams.type';
import { Job } from 'bullmq';
import { VotingQueueName } from '../voting/enum/VotingQueue.enum';

@Processor('voting')
export class FleaMarketVotingProcessor extends WorkerHost {
  constructor(private readonly fleaMarketService: FleaMarketService) {
    super();
  }

  /**
   * Processes the job when it is executed.
   * @param job - The job to be processed.
   */
  async process(job: Job<VotingQueueParams>): Promise<any> {
    if (job.name === VotingQueueName.FLEA_MARKET)
      await this.fleaMarketService.checkVotingOnExpire(job.data);
  }
}
