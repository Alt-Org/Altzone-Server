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

type RandomOpponentTimeoutJob = {
  inviteId: string;
};

type MatchmakingJob = ClanOpponentTimeoutJob | RandomOpponentTimeoutJob;

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
        jobId: `clan-opponent-timeout-${inviteId}`,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
      },
    );
  }

  async cancelClanOpponentTimeout(inviteId: string) {
    return this.queue.remove(`clan-opponent-timeout-${inviteId}`);
  }

  /**
   * Schedules the end of the RANDOM human-opponent search window.
   */
  async scheduleRandomOpponentTimeout(inviteId: string, delaySeconds: number) {
    return this.queue.add(
      'randomOpponentTimeout',
      { inviteId } satisfies RandomOpponentTimeoutJob,
      {
        delay: delaySeconds * 1000,
        jobId: `random-opponent-timeout-${inviteId}`,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
      },
    );
  }

  async cancelRandomOpponentTimeout(inviteId: string) {
    return this.queue.remove(`random-opponent-timeout-${inviteId}`);
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
  async process(job: Job<MatchmakingJob>): Promise<void> {
    if (job.name === 'clanOpponentTimeout') {
      await this.service.handleClanOpponentTimeout(job.data.inviteId);
      return;
    }

    if (job.name === 'randomOpponentTimeout') {
      await this.service.handleRandomOpponentTimeout(job.data.inviteId);
    }
  }
}
