import { UpdateBoxDto } from '../../../../box/dto/updateBox.dto';
import { SessionStage } from '../../../../box/enum/SessionStage.enum';
import { ObjectId } from 'mongodb';
import { DailyTask } from '../../../../dailyTasks/dailyTasks.schema';
import { ClanToCreateDto } from '../../../../box/dto/clanToCreate.dto';

export default class UpdateBoxDtoBuilder {
  private readonly base: Partial<UpdateBoxDto> = {
    _id: undefined,
    adminPassword: undefined,
    sessionStage: undefined,
    testersSharedPassword: undefined,
    boxRemovalTime: undefined,
    sessionResetTime: undefined,
    adminProfile_id: undefined,
    adminPlayer_id: undefined,
    createdClan_ids: undefined,
    clansToCreate: undefined,
    chat_id: undefined,
    accountClaimersIds: undefined,
    dailyTasks: undefined,
  };

  build(): UpdateBoxDto {
    return { ...this.base } as UpdateBoxDto;
  }

  setId(id: string) {
    this.base._id = id;
    return this;
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

  setCreatedClan_ids(clanIds: ObjectId[]) {
    this.base.createdClan_ids = clanIds;
    return this;
  }

  setClansToCreate(clans: ClanToCreateDto[]) {
    this.base.clansToCreate = clans;
    return this;
  }

  setChatId(chatId: ObjectId) {
    this.base.chat_id = chatId;
    return this;
  }

  setAccountClaimersIds(accountClaimersIds: string[]) {
    this.base.accountClaimersIds = accountClaimersIds;
    return this;
  }

  setDailyTasks(dailyTasks: DailyTask[]) {
    this.base.dailyTasks = dailyTasks;
    return this;
  }
}
