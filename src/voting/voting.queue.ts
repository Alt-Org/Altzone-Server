import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { VotingQueueParams } from '../fleaMarket/types/votingQueueParams.type';
import { Queue } from 'bullmq';

@Injectable()
export class VotingQueue {
  /**
   * Creates an instance of VotingQueue.
   * @param votingQueue - The Bull queue instance for voting.
   */
  constructor(@InjectQueue('voting') private readonly votingQueue: Queue) {}

  /**
   * Adds a voting check job to the queue with a specified delay.
   * @param params - The parameters for the voting check job.
   */
  async addVotingCheckJob(params: VotingQueueParams) {
    const delay = params.voting.endsOn.getTime() - Date.now();
    await this.votingQueue.add(params.queue, params, { delay });
  }
}
