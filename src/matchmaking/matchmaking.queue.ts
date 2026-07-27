import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { MatchmakingService } from './matchmaking.service';

/**
 * Shared BullMQ queue name for delayed matchmaking jobs.
 */
export const MATCHMAKING_QUEUE = 'matchmaking';

type ClanOpponentTimeoutJob = {
  inviteId: string;
};

/**
 * Queue facade used by the service.
 *
 * The service only needs to schedule domain-level jobs; BullMQ-specific job
 * options stay here.
 */
@Injectable()
export class MatchmakingQueue {
  constructor(@InjectQueue(MATCHMAKING_QUEUE) private readonly queue: Queue) {}

  /**
   * Schedules the CLAN fallback window.
   *
   * If no opposing clan team appears before the delay expires, the processor
   * asks the service to create a bot opponent.
   */
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

/**
 * BullMQ worker for matchmaking delayed jobs.
 */
@Processor(MATCHMAKING_QUEUE)
export class MatchmakingProcessor extends WorkerHost {
  constructor(
    @Inject(forwardRef(() => MatchmakingService))
    private readonly service: MatchmakingService,
  ) {
    super();
  }

  /**
   * Dispatches known matchmaking jobs back into the service layer.
   */
  async process(job: Job<ClanOpponentTimeoutJob>): Promise<void> {
    if (job.name !== 'clanOpponentTimeout') return;

    await this.service.handleClanOpponentTimeout(job.data.inviteId);
  }
}
