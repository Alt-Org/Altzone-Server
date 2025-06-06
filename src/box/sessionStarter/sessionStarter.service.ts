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
  ) {
    this.basicService = new BasicService(taskModel);
  }

  private readonly basicService: BasicService;

  /**
   * Starts a testing session which means:
   * - Creates predefined daily tasks for each clan
   * - Defines clan admins from the testers
   * - Generates and sets testers shared password
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
    const [, validationErrors] = this.validateBox_id(box_id);
    if (validationErrors) return [null, validationErrors];

    const box_idString = box_id.toString();

    const [boxInDB, errors] =
      await this.basicService.readOneById<BoxDocument>(box_idString);
    if (errors) return [null, errors];

    const dailyTasksToCreate = boxInDB.dailyTasks.map((task) => task['_doc']);
    const [, tasksCreationErrors] = await this.createDailyTasks(
      dailyTasksToCreate,
      boxInDB.clan_ids[0],
      boxInDB.clan_ids[1],
    );
    if (tasksCreationErrors) return [null, tasksCreationErrors];

    const [, clanAdminsErrors] = await this.setClanAdmins(
      boxInDB.adminPlayer_id,
      boxInDB.clan_ids[0],
      boxInDB.clan_ids[1],
    );
    if (clanAdminsErrors) return [null, clanAdminsErrors];

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
  ): Promise<IServiceReturn<true>> {
    const dailyTasksToCreate = tasks.map((dailyTask) => {
      return {
        ...dailyTask,
        amountLeft: dailyTask.amount,
        title: { fi: dailyTask.title },
        timeLimitMinutes: 30,
        player_id: null,
        _id: undefined,
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
   * Sets one of the testers to be a clan admin
   * @param admin_id player _id of the box admin
   * @param clan1_id first clan _id
   * @param clan2_id second clan _id
   * @private
   * @returns true if _id is valid or ServiceErrors if not
   */
  private async setClanAdmins(
    admin_id: string | ObjectId,
    clan1_id: string | ObjectId,
    clan2_id: string | ObjectId,
  ): Promise<IServiceReturn<true>> {
    const clan1Admin = await this.playerModel.findOne({
      clan_id: clan1_id,
      _id: { $ne: admin_id },
    });
    if (!clan1Admin)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            message: 'Could not fond any tester to be a clan 1 admin',
          }),
        ],
      ];
    const clan2Admin = await this.playerModel.findOne({
      clan_id: clan2_id,
      _id: { $ne: admin_id },
    });
    if (!clan2Admin)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            message: 'Could not fond any tester to be a clan 2 admin',
          }),
        ],
      ];

    await this.clanModel.findByIdAndUpdate(clan1_id, {
      admin_ids: [clan1Admin._id.toString()],
    });
    await this.clanModel.findByIdAndUpdate(clan2_id, {
      admin_ids: [clan2Admin._id.toString()],
    });

    return [true, null];
  }

  /**
   * Validates _id of the box
   * @param box_id box _id to validate
   * @private
   *
   * @returns true if _id is valid or ServiceErrors if not
   */
  private validateBox_id(box_id: string | ObjectId): IServiceReturn<true> {
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

    return [true, null];
  }
}
