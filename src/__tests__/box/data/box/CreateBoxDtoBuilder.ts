import {SessionStage} from "../../../../box/enum/SessionStage.enum";
import {ObjectId} from "mongodb";
import {Tester} from "../../../../box/schemas/tester.schema";
import {DailyTask} from "../../../../dailyTasks/dailyTasks.schema";
import {CreateBoxDto} from "../../../../box/dto/createBox.dto";


export default class CreateBoxDtoBuilder {
    private readonly base: Partial<CreateBoxDto> = {
        adminPassword: 'defaultAdminPassword',
        sessionStage: SessionStage.PREPARING,
        testersSharedPassword: null,
        boxRemovalTime: Date.now() + 1000000,
        sessionResetTime: Date.now() + 500000,
        adminProfile_id: null,
        adminPlayer_id: null,
        clan_ids: [],
        soulHome_ids: [],
        room_ids: [],
        stock_ids: [],
        chat_id: null,
        testers: [],
        accountClaimersIds: [],
        dailyTasks: [],
    };

    build(): CreateBoxDto {
        return { ...this.base } as CreateBoxDto;
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

    setChatId(chatId: ObjectId) {
        this.base.chat_id = chatId;
        return this;
    }

    setTesters(testers: Tester[]) {
        this.base.testers = testers;
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
