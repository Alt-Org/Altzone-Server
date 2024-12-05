import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { VotingQueueParams } from "./types/votingQueueParams.type";
import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { FleaMarketService } from "./fleaMarket.service";

@Injectable()
export class VotingQueue {
    /**
     * Creates an instance of VotingQueue.
     * @param votingQueue - The Bull queue instance for voting.
     */
    constructor(@InjectQueue("voting") private readonly votingQueue: Queue) {}

    /**
     * Adds a voting check job to the queue with a specified delay.
     * @param params - The parameters for the voting check job.
     */
    async addVotingCheckJob(params: VotingQueueParams) {
        const delay = params.voting.endsOn.getTime() - Date.now();
        await this.votingQueue.add("voting", params, { delay });
    }
}

@Processor("voting")
export class VotingProcessor extends WorkerHost {
    /**
     * Creates an instance of TestProcessor.
     * @param fleaMarketService - The FleaMarketService instance.
     */
    constructor(
        @Inject(forwardRef(() => FleaMarketService))
        private readonly fleaMarketService: FleaMarketService
    ) {
        super();
    }

    /**
     * Processes the job when it is executed.
     * @param job - The job to be processed.
     */
    async process(job: Job): Promise<any> {
        await this.fleaMarketService.checkVotingOnExpire(job.data);
    }
}
