import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { PlayerModule } from '../../../player/player.module';
import { ClanModule } from '../../../clan/clan.module';
import { PlayerRewarder } from '../../../rewarder/playerRewarder/playerRewarder.service';
import { ClanRewarder } from '../../../rewarder/clanRewarder/clanRewarder.service';

export default class RewarderCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!RewarderCommonModule.module)
      RewarderCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          PlayerModule,
          ClanModule,
        ],
        providers: [PlayerRewarder, ClanRewarder],
      }).compile();

    return RewarderCommonModule.module;
  }
}
