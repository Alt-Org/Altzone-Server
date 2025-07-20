import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { IServiceReturn } from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { InjectModel } from '@nestjs/mongoose';
import { Box, BoxDocument } from '../schemas/box.schema';
import { Model } from 'mongoose';
import BasicService from '../../common/service/basicService/BasicService';
import { DailyTasksService } from '../../dailyTasks/dailyTasks.service';
import { Player } from '../../player/schemas/player.schema';
import { Clan } from '../../clan/clan.schema';
import { PasswordGenerator } from '../../common/function/passwordGenerator';
import { SessionStage } from '../enum/SessionStage.enum';
import { PredefinedDailyTask } from '../dailyTask/predefinedDailyTask.schema';
import BoxCreator from '../boxCreator';

/**
 * Class responsible for starting the testing session process.
 */
@Injectable()
export default class SessionStarterService {
  constructor(
    @InjectModel(Box.name) public readonly taskModel: Model<Box>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    private readonly dailyTasksService: DailyTasksService,
    private readonly passwordGenerator: PasswordGenerator,
    private readonly boxCreator: BoxCreator,
  ) {
    this.basicService = new BasicService(taskModel);
  }

  private readonly basicService: BasicService;

  /**
   * Starts a testing session which means:
   * - Creates predefined daily tasks and clans
   * - Generates and sets shared password
   * - Sets testing session stage to TESTING
   * - Sets reset and removal times of the box
   *
   * @param box_id _id of the box where to start the session
   *
   * @returns true if the session is started successfully, or ServiceErrors:
   * - REQUIRED if the box_id is not provided
   * - NOT_FOUND if the box with that _id does not exist
   */
  async start(box_id: ObjectId | string): Promise<IServiceReturn<true>> {
    const [boxInDB, error] = await this.getAndValidateBox(box_id);
    if (error) return [null, error];

    const [clans, err] = await this.boxCreator.createBoxClans(
      boxInDB.clansToCreate[0].name,
      boxInDB.clansToCreate[1].name,
      box_id.toString(),
    );
    if (err) return [null, err];
    boxInDB.createdClan_ids = clans.map((c) => {
      return new ObjectId(c._id);
    });

    const [_, updateErr] = await this.basicService.updateOneById(
      box_id.toString(),
      {
        createdClan_ids: boxInDB.createdClan_ids,
      },
    );
    if (updateErr) return [null, updateErr];

    const dailyTasksToCreate = boxInDB.dailyTasks.map((task) => task['_doc']);
    const [, tasksCreationErrors] = await this.createDailyTasks(
      dailyTasksToCreate,
      clans[0]._id,
      clans[1]._id,
      box_id.toString(),
    );
    if (tasksCreationErrors) return [null, tasksCreationErrors];

    const randNumber = Math.floor(1 + Math.random() * 99);
    const testersPassword =
      this.passwordGenerator.generatePassword('fi') + `-${randNumber}`;

    const now = new Date().getTime();
    const timeAfterWeek = now + 60 * 60 * 24 * 7;
    const timeAfterMonth = now + 60 * 60 * 24 * 30;

    const [, boxUpdateErrors] = await this.basicService.updateOneById<
      Partial<Box>
    >(box_id.toString(), {
      sessionStage: SessionStage.TESTING,
      testersSharedPassword: testersPassword,
      sessionResetTime: timeAfterWeek,
      boxRemovalTime: timeAfterMonth,
    });
    if (boxUpdateErrors) return [null, boxUpdateErrors];

    return [true, null];
  }

  /**
   * Creates daily tasks for the specified clans from the array of PredefinedDailyTask
   *
   * @param tasks tasks to create
   * @param clan1_id first where clan tasks to be added
   * @param clan2_id second clan where tasks to be added
   * @private
   *
   * @returns true if tasks was created or ServiceErrors if any occurred
   */
  private async createDailyTasks(
    tasks: PredefinedDailyTask[],
    clan1_id: string | ObjectId,
    clan2_id: string | ObjectId,
    box_id: string,
  ): Promise<IServiceReturn<true>> {
    const dailyTasksToCreate = tasks.map((dailyTask) => {
      return {
        ...dailyTask,
        amountLeft: dailyTask.amount,
        title: { fi: dailyTask.title },
        timeLimitMinutes: 30,
        player_id: null,
        _id: undefined,
        box_id,
      };
    });

    const clan1Tasks = dailyTasksToCreate.map((dailyTask) => {
      return { ...dailyTask, clan_id: clan1_id as any };
    });

    const clan2Tasks = dailyTasksToCreate.map((dailyTask) => {
      return { ...dailyTask, clan_id: clan2_id as any };
    });

    const [, clan1TasksCreationErrors] =
      await this.dailyTasksService.createMany(clan1Tasks);
    if (clan1TasksCreationErrors) return [null, clan1TasksCreationErrors];

    const [, clan2TasksCreationErrors] =
      await this.dailyTasksService.createMany(clan2Tasks);
    if (clan2TasksCreationErrors) return [null, clan2TasksCreationErrors];

    return [true, null];
  }

  /**
   * Get and validate a box
   * @param box_id box _id to get and validate
   * @private
   *
   * @returns Box if it's valid and service error if not.
   */
  private async getAndValidateBox(
    box_id: string | ObjectId,
  ): Promise<IServiceReturn<BoxDocument>> {
    if (!box_id || box_id === '')
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'box_id',
            value: box_id,
            message: 'box_id is required',
          }),
        ],
      ];

    const [boxInDB, errors] = await this.basicService.readOneById<BoxDocument>(
      box_id.toString(),
    );
    if (errors) return [null, errors];

    if (boxInDB.sessionStage !== SessionStage.PREPARING) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.MISCONFIGURED,
            message: `Cannot start session: sessionStage is '${boxInDB.sessionStage}'. Session must be in 'PREPARING' stage to start. Use the reset endpoint if the session has ended.`,
          }),
        ],
      ];
    }

    return [boxInDB, null];
  }
}
