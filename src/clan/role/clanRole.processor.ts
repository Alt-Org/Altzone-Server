import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { VotingQueueName } from '../../voting/enum/VotingQueue.enum';
import ClanRoleService from './clanRole.service';
import { VotingQueueParams } from '../../fleaMarket/types/votingQueueParams.type';
import { VotingService } from '../../voting/voting.service';
import { VotingDto } from '../../voting/dto/voting.dto';

@Processor(VotingQueueName.CLAN_ROLE)
export class ClanRoleVotingProcessor extends WorkerHost {
  constructor(
    private readonly clanRoleService: ClanRoleService,
    private readonly votingService: VotingService,
  ) {
    super();
  }

  async process(job: Job<VotingQueueParams>): Promise<any> {
    // IMPORTANT:
    // Do not trust job.data.voting as the source of truth.
    // It was stored when the voting was created, so it may not contain votes
    // that were added later.
    const [freshVoting, errors] =
      await this.votingService.basicService.readOneById<VotingDto>(
        job.data.voting._id,
      );

    if (errors || !freshVoting) {
      return;
    }

    // Now the role update decision is based on the latest persisted votes.
    await this.clanRoleService.checkVotingOnExpire(freshVoting);
  }
}
