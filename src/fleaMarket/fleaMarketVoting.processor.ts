import { Processor, WorkerHost } from '@nestjs/bullmq';
import { FleaMarketService } from './fleaMarket.service';
import { VotingQueueParams } from './types/votingQueueParams.type';
import { Job } from 'bullmq';
import { VotingQueueName } from '../voting/enum/VotingQueue.enum';

@Processor(VotingQueueName.FLEA_MARKET)
export class FleaMarketVotingProcessor extends WorkerHost {
  constructor(private readonly fleaMarketService: FleaMarketService) {
    super();
  }

  /**
   * Processes the job when it is executed.
   * @param job - The job to be processed.
   */
  async process(job: Job<VotingQueueParams>): Promise<any> {
    await this.fleaMarketService.checkVotingOnExpire(job.data);
  }
}
