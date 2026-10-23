import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ClanShopService } from './clanShop.service';
import { VotingQueueParams } from '../fleaMarket/types/votingQueueParams.type';
import { VotingQueueName } from '../voting/enum/VotingQueue.enum';
import { VotingDto } from '../voting/dto/voting.dto';
import { VotingService } from '../voting/voting.service';

@Processor(VotingQueueName.CLAN_SHOP)
export class ClanShopVotingProcessor extends WorkerHost {
  constructor(
    private readonly clanShopService: ClanShopService,
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

    if (freshVoting.endedAt) return;

    await this.clanShopService.checkVotingOnExpire({
      ...job.data,
      voting: freshVoting,
    });
  }
}
