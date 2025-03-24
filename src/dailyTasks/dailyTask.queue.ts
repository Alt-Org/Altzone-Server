import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { TASK_CONSTS } from './consts/taskConstants';
import { Job } from 'bullmq';
import { DailyTaskDto } from './dto/dailyTask.dto';
import { Queue } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { DailyTask } from './dailyTasks.schema';
import { Model } from 'mongoose';
import BasicService from '../common/service/basicService/BasicService';
import DailyTaskNotifier from './dailyTask.notifier';

@Injectable()
export class DailyTaskQueue {
  constructor(
    @InjectQueue('daily-tasks') private readonly dailyTaskQueue: Queue,
  ) {}

  async addDailyTask(task: DailyTaskDto) {
    if (!task.player_id || !task.startedAt) return;
    const delay = TASK_CONSTS.TIME * task.timeLimitMinutes; // convert minutes to ms
    await this.dailyTaskQueue.add('tasks', task, { delay });
  }
}

@Processor('daily-tasks')
export class DailyTaskProcessor extends WorkerHost {
  constructor(
    @InjectModel(DailyTask.name) public readonly model: Model<DailyTask>,
    private readonly notifier: DailyTaskNotifier,
  ) {
    super();
    this.basicService = new BasicService(model);
  }

  public readonly basicService: BasicService;

  async process(job: Job): Promise<any> {
    await this.handleExpiredTask(job.data);
  }

  /**
   * Handles the expiration of a daily task by resetting its playerId, amountLeft and startedAt fields.
   *
   * @param task - The daily task data transfer object containing task details.
   *
   * @throws - If there is error updating the task im db.
   */
  async handleExpiredTask(task: DailyTaskDto) {
    const [_, updateError] = await this.basicService.updateOne(
      {
        $set: {
          amountLeft: task.amount,
        },
        $unset: {
          playerId: '',
          startedAt: '',
        },
      },
      { filter: { _id: task._id } },
    );
    if (updateError) throw updateError;

    const playerId = task.player_id;
    task.amountLeft = task.amount;
    task.player_id = undefined;
    task.startedAt = null;

    this.notifier.taskUpdated(playerId, task);
  }
}
