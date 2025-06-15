import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { VotingQueueName } from '../../voting/enum/VotingQueue.enum';
import ClanRoleService from './clanRole.service';
import { VotingQueueParams } from '../../fleaMarket/types/votingQueueParams.type';

@Processor(VotingQueueName.CLAN_ROLE)
export class ClanRoleVotingProcessor extends WorkerHost {
  constructor(private readonly clanRoleService: ClanRoleService) {
    super();
  }

  /**
   * Processes the job when it is executed.
   * @param job - The job to be processed.
   */
  async process(job: Job<VotingQueueParams>): Promise<any> {
    await this.clanRoleService.checkVotingOnExpire(job.data.voting);
  }
}
