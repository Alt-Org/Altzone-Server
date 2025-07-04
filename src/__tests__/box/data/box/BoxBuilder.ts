import { SessionStage } from '../../../../box/enum/SessionStage.enum';
import { Box } from '../../../../box/schemas/box.schema';
import { ObjectId } from 'mongodb';
import { PredefinedDailyTask } from '../../../../box/dailyTask/predefinedDailyTask.schema';

export default class BoxBuilder {
  private readonly base: Partial<Box> = {
    adminPassword: 'defaultAdminPassword',
    sessionStage: SessionStage.PREPARING,
    testersSharedPassword: undefined,
    boxRemovalTime: Date.now() + 1000000,
    sessionResetTime: Date.now() + 500000,
    adminProfile_id: undefined,
    adminPlayer_id: undefined,
    clan_ids: [],
    soulHome_ids: [],
    room_ids: [],
    stock_ids: [],
    accountClaimersIds: [],
    dailyTasks: [],
    _id: undefined,
  };

  build(): Box {
    return { ...this.base } as Box;
  }

  setAdminPassword(password: string) {
    this.base.adminPassword = password;
    return this;
  }

  setSessionStage(stage: SessionStage) {
    this.base.sessionStage = stage;
    return this;
  }

  setTestersSharedPassword(password: string | null) {
    this.base.testersSharedPassword = password;
    return this;
  }

  setBoxRemovalTime(time: number) {
    this.base.boxRemovalTime = time;
    return this;
  }

  setSessionResetTime(time: number) {
    this.base.sessionResetTime = time;
    return this;
  }

  setAdminProfileId(profileId: ObjectId) {
    this.base.adminProfile_id = profileId;
    return this;
  }

  setAdminPlayerId(playerId: ObjectId) {
    this.base.adminPlayer_id = playerId;
    return this;
  }

  setClanIds(clanIds: ObjectId[]) {
    this.base.clan_ids = clanIds;
    return this;
  }

  setSoulHomeIds(soulHomeIds: ObjectId[]) {
    this.base.soulHome_ids = soulHomeIds;
    return this;
  }

  setRoomIds(roomIds: ObjectId[]) {
    this.base.room_ids = roomIds;
    return this;
  }

  setStockIds(stockIds: ObjectId[]) {
    this.base.stock_ids = stockIds;
    return this;
  }

  setAccountClaimersIds(accountClaimersIds: string[]) {
    this.base.accountClaimersIds = accountClaimersIds;
    return this;
  }

  setDailyTasks(dailyTasks: PredefinedDailyTask[]) {
    this.base.dailyTasks = dailyTasks;
    return this;
  }

  setId(id: ObjectId) {
    this.base._id = id;
    return this;
  }
}
