import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { IServiceReturn } from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Box, BoxDocument } from '../schemas/box.schema';
import { ClientSession, Connection, Model } from 'mongoose';
import BasicService from '../../common/service/basicService/BasicService';
import { DailyTasksService } from '../../dailyTasks/dailyTasks.service';
import { Player } from '../../player/schemas/player.schema';
import { Clan } from '../../clan/clan.schema';
import { PasswordGenerator } from '../../common/function/passwordGenerator';
import { SessionStage } from '../enum/SessionStage.enum';
import { PredefinedDailyTask } from '../dailyTask/predefinedDailyTask.schema';
import { SoulHome } from '../../clanInventory/soulhome/soulhome.schema';
import { Room } from '../../clanInventory/room/room.schema';
import { Stock } from '../../clanInventory/stock/stock.schema';
import { Item } from '../../clanInventory/item/item.schema';
import { ClanLabel } from '../../clan/enum/clanLabel.enum';
import { ClanService } from '../../clan/clan.service';
import {
  cancelTransaction,
  endTransaction,
  InitializeSession,
} from '../../common/function/Transactions';

/**
 * Class responsible for starting the testing session process.
 */
@Injectable()
export default class SessionStarterService {
  constructor(
    @InjectModel(Box.name) public readonly taskModel: Model<Box>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(SoulHome.name) private readonly soulHomeModel: Model<SoulHome>,
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
    @InjectModel(Stock.name) private readonly stockModel: Model<Stock>,
    @InjectModel(Item.name) private readonly itemModel: Model<Item>,
    @InjectConnection() private readonly connection: Connection,
    private readonly clanService: ClanService,
    private readonly dailyTasksService: DailyTasksService,
    private readonly passwordGenerator: PasswordGenerator,
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
   * @param openedSession - (Optional) An already opened ClientSession to use.
   *
   * @returns true if the session is started successfully, or ServiceErrors:
   * - REQUIRED if the box_id is not provided
   * - NOT_FOUND if the box with that _id does not exist
   */
  async start(
    box_id: ObjectId | string,
    openedSession?: ClientSession,
  ): Promise<IServiceReturn<true>> {
    const randNumber = Math.floor(1 + Math.random() * 99);
    const testersPassword =
      this.passwordGenerator.generatePassword('fi') + `-${randNumber}`;

    const now = new Date().getTime();
    const timeAfterWeek = now + 60 * 60 * 24 * 7;
    const timeAfterMonth = now + 60 * 60 * 24 * 30;

    const [boxInDB, error] = await this.getAndValidateBox(box_id);
    if (error) return [null, error];

    const [clans, err] = await this.createBoxClans(
      boxInDB.clansToCreate[0].name,
      boxInDB.clansToCreate[1].name,
      box_id.toString(),
    );
    if (err) return [null, err];

    boxInDB.createdClan_ids = clans.map((c) => {
      return new ObjectId(c._id);
    });

    const session = await InitializeSession(this.connection, openedSession);

    const [_, updateErr] = await this.basicService.updateOneById(
      box_id.toString(),
      {
        createdClan_ids: boxInDB.createdClan_ids,
      },
    );
    if (updateErr)
      return await cancelTransaction(session, updateErr, openedSession);

    const dailyTasksToCreate = boxInDB.dailyTasks.map((task) => task['_doc']);
    const [, tasksCreationErrors] = await this.createDailyTasks(
      dailyTasksToCreate,
      clans[0]._id,
      clans[1]._id,
      box_id.toString(),
      session,
    );
    if (tasksCreationErrors) return [null, tasksCreationErrors];

    const [, boxUpdateErrors] = await this.basicService.updateOneById<
      Partial<Box>
    >(box_id.toString(), {
      sessionStage: SessionStage.TESTING,
      testersSharedPassword: testersPassword,
      sessionResetTime: timeAfterWeek,
      boxRemovalTime: timeAfterMonth,
    });
    if (boxUpdateErrors)
      return await cancelTransaction(session, boxUpdateErrors, openedSession);

    return await endTransaction(session, openedSession);
  }

  /**
   * Creates 2 clans for the box.
   *
   * Notice that names of the clans should be unique.
   *
   * @param clanName1 name of the first clan
   * @param clanName2 name of the second clan
   * @param box_id Id of the box clan belongs to.
   * @param openedSession - (Optional) An already opened ClientSession to use
   * @returns created clans or ServiceErrors if any occurred
   */
  public async createBoxClans(
    clanName1: string,
    clanName2: string,
    box_id: string,
    openedSession?: ClientSession,
  ): Promise<IServiceReturn<Clan[]>> {
    const session = await InitializeSession(this.connection, openedSession);

    const [clan1Resp, clan1Errors] = await this.createBoxClan(
      clanName1,
      box_id,
      session,
    );
    if (clan1Errors)
      return await cancelTransaction(session, clan1Errors, openedSession);

    const [clan2Resp, clan2Errors] = await this.createBoxClan(
      clanName2,
      box_id,
      session,
    );
    if (clan2Errors)
      return await cancelTransaction(session, clan2Errors, openedSession);

    return await endTransaction(session, [clan1Resp, clan2Resp], openedSession);
  }

  /**
   * Creates a clan for the box.
   *
   * Notice that clan name must be unique.
   *
   * @param clanName name of the clan
   * @param box_id Id of the box clan belongs to.
   *
   * @returns created clan or ServiceErrors if any occurred
   */
  private async createBoxClan(
    clanName: string,
    box_id: string,
    session: ClientSession,
  ): Promise<IServiceReturn<Clan>> {
    const defaultClanData = {
      tag: '',
      labels: [ClanLabel.GAMERIT],
      phrase: 'Not-set',
    };

    const [createdClan, clanCreationErrors] =
      await this.clanService.createOneWithoutAdmin({
        name: clanName,
        ...defaultClanData,
      });

    if (clanCreationErrors)
      return await cancelTransaction(session, clanCreationErrors);

    const [, clanUpdateErrors] = await this.clanService.updateOneById({
      box_id,
      _id: createdClan._id.toString(),
    } as any);
    if (clanUpdateErrors)
      return await cancelTransaction(session, clanUpdateErrors);

    const { soulHome, soulHomeItems, stock } = createdClan;

    const soulHomeItemIds = soulHomeItems.map((item) => item._id);

    await this.soulHomeModel.findByIdAndUpdate(soulHome._id, { box_id });
    await this.roomModel.updateMany({ soulHome_id: soulHome._id }, { box_id });
    await this.itemModel.updateMany(
      { _id: { $in: soulHomeItemIds } },
      { box_id },
    );

    await this.stockModel.findByIdAndUpdate(stock._id, { box_id });
    await this.itemModel.updateMany({ stock_id: stock._id }, { box_id });

    return [createdClan, null];
  }

  /**
   * Creates daily tasks for the specified clans from the array of PredefinedDailyTask
   *
   * @param tasks tasks to create
   * @param clan1_id first where clan tasks to be added
   * @param clan2_id second clan where tasks to be added
   * @param box_id _id of the box
   * @private
   *
   * @returns true if tasks was created or ServiceErrors if any occurred
   */
  private async createDailyTasks(
    tasks: PredefinedDailyTask[],
    clan1_id: string | ObjectId,
    clan2_id: string | ObjectId,
    box_id: string,
    session: ClientSession,
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
    if (clan1TasksCreationErrors)
      return await cancelTransaction(session, clan1TasksCreationErrors);

    const [, clan2TasksCreationErrors] =
      await this.dailyTasksService.createMany(clan2Tasks);
    if (clan2TasksCreationErrors)
      return await cancelTransaction(session, clan2TasksCreationErrors);

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
