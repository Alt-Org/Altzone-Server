import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { MatchmakingService } from './matchmaking.service';

export const MATCHMAKING_QUEUE = 'matchmaking';

type ClanOpponentTimeoutJob = {
  inviteId: string;
};

@Injectable()
export class MatchmakingQueue {
  constructor(@InjectQueue(MATCHMAKING_QUEUE) private readonly queue: Queue) {}

  async scheduleClanOpponentTimeout(inviteId: string, delaySeconds: number) {
    return this.queue.add(
      'clanOpponentTimeout',
      { inviteId } satisfies ClanOpponentTimeoutJob,
      {
        delay: delaySeconds * 1000,
        jobId: `clan-opponent-timeout:${inviteId}`,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
      },
    );
  }
}

@Processor(MATCHMAKING_QUEUE)
export class MatchmakingProcessor extends WorkerHost {
  constructor(
    @Inject(forwardRef(() => MatchmakingService))
    private readonly service: MatchmakingService,
  ) {
    super();
  }

  async process(job: Job<ClanOpponentTimeoutJob>): Promise<void> {
    if (job.name !== 'clanOpponentTimeout') return;

    await this.service.handleClanOpponentTimeout(job.data.inviteId);
  }
}
