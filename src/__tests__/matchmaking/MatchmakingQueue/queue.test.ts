import { Job, Queue } from 'bullmq';
import {
  MatchmakingProcessor,
  MatchmakingQueue,
} from '../../../matchmaking/matchmaking.queue';
import { MatchmakingService } from '../../../matchmaking/matchmaking.service';

describe('MatchmakingQueue', () => {
  const inviteId = '665af23e5e982f0013aa334b';
  let add: jest.Mock;
  let matchmakingQueue: MatchmakingQueue;

  beforeEach(() => {
    add = jest.fn().mockResolvedValue({ id: 'scheduled-job' });
    matchmakingQueue = new MatchmakingQueue({ add } as unknown as Queue);
  });

  it('schedules the clan opponent timeout with a BullMQ-safe job id', async () => {
    await matchmakingQueue.scheduleClanOpponentTimeout(inviteId, 30);

    expect(add).toHaveBeenCalledWith(
      'clanOpponentTimeout',
      { inviteId },
      {
        delay: 30_000,
        jobId: `clan-opponent-timeout-${inviteId}`,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
      },
    );

    const jobOptions = add.mock.calls[0][2];
    expect(jobOptions.jobId).not.toContain(':');
  });

  it('returns the job created by BullMQ', async () => {
    const scheduledJob = await matchmakingQueue.scheduleClanOpponentTimeout(
      inviteId,
      30,
    );

    expect(scheduledJob).toEqual({ id: 'scheduled-job' });
  });
});

describe('MatchmakingProcessor', () => {
  let handleClanOpponentTimeout: jest.Mock;
  let processor: MatchmakingProcessor;

  beforeEach(() => {
    handleClanOpponentTimeout = jest.fn().mockResolvedValue(undefined);
    processor = new MatchmakingProcessor({
      handleClanOpponentTimeout,
    } as unknown as MatchmakingService);
  });

  it('handles a scheduled clan opponent timeout', async () => {
    const job = {
      name: 'clanOpponentTimeout',
      data: { inviteId: 'invite-1' },
    } as Job<{ inviteId: string }>;

    await processor.process(job);

    expect(handleClanOpponentTimeout).toHaveBeenCalledWith('invite-1');
  });

  it('ignores jobs with an unknown name', async () => {
    const job = {
      name: 'unknownJob',
      data: { inviteId: 'invite-1' },
    } as Job<{ inviteId: string }>;

    await processor.process(job);

    expect(handleClanOpponentTimeout).not.toHaveBeenCalled();
  });
});
