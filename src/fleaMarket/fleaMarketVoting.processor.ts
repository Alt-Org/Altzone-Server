import { Processor, WorkerHost } from '@nestjs/bullmq';
import { FleaMarketService } from './fleaMarket.service';
import { VotingQueueParams } from './types/votingQueueParams.type';
import { Job } from 'bullmq';
import { VotingQueueName } from '../voting/enum/VotingQueue.enum';
import { VotingDto } from '../voting/dto/voting.dto';
import { VotingService } from '../voting/voting.service';

@Processor(VotingQueueName.FLEA_MARKET)
export class FleaMarketVotingProcessor extends WorkerHost {
  constructor(
    private readonly fleaMarketService: FleaMarketService,
    private readonly votingService: VotingService,
  ) {
    super();
  }

  /**
   * Processes the job when it is executed.
   * @param job - The job to be processed.
   */
  async process(job: Job<VotingQueueParams>): Promise<any> {
    const [freshVoting, errors] =
      await this.votingService.basicService.readOneById<VotingDto>(
        job.data.voting._id,
      );

    if (errors || !freshVoting) return;

    // If the voting has already been finalized (e.g., by reaching the threshold early),
    // we don't need to process it again here.
    if (freshVoting.endedAt) return;

    await this.fleaMarketService.checkVotingOnExpire({
      ...job.data,
      voting: freshVoting,
    });
  }
}
