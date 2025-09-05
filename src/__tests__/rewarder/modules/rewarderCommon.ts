import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { PlayerModule } from '../../../player/player.module';
import { ClanModule } from '../../../clan/clan.module';
import { PlayerRewarder } from '../../../rewarder/playerRewarder/playerRewarder.service';
import { ClanRewarder } from '../../../rewarder/clanRewarder/clanRewarder.service';
import { ModelName } from '../../../common/enum/modelName.enum';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { ClanSchema } from '../../../clan/clan.schema';

export default class RewarderCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!RewarderCommonModule.module)
      RewarderCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.PLAYER, schema: PlayerSchema },
            { name: ModelName.CLAN, schema: ClanSchema },
          ]),
          PlayerModule,
          ClanModule,
        ],
        providers: [PlayerRewarder, ClanRewarder],
      }).compile();

    return RewarderCommonModule.module;
  }
}
