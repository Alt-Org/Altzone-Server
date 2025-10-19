import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { JukeboxService } from './jukebox.service';

@Injectable()
export class JukeboxQueue {
  constructor(@InjectQueue('playlist') private readonly queue: Queue) {}

  async scheduleNextSong(clanId: string, delaySeconds: number) {
    try {
      return await this.queue.add(
        'nextSong',
        { clanId },
        {
          delay: delaySeconds * 1000,
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
        },
      );
    } catch (err) {
      console.error('Failed to schedule next song:', err);
      throw err;
    }
  }
}

@Processor('playlist')
export class JukeboxProcessor extends WorkerHost {
  constructor(
    @Inject(forwardRef(() => JukeboxService))
    private readonly service: JukeboxService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      const { clanId } = job.data;
      await this.service.startNextSong(clanId);
    } catch (err) {
      console.error(`Failed processing song change with job ${job.id}`, err);
      throw err;
    }
  }
}
