import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { ModelName } from '../../../common/enum/modelName.enum';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ClanInventoryModule } from '../../../clanInventory/clanInventory.module';
import { PlayerModule } from '../../../player/player.module';
import { VotingModule } from '../../../voting/voting.module';
import { ClanModule } from '../../../clan/clan.module';
import { FeedbackService } from '../../../feedback/feedback.service';
import { FeedbackSchema } from '../../../feedback/feedback.schema';
import { ProfileSchema } from '../../../profile/profile.schema';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { ClanSchema } from '../../../clan/clan.schema';

export default class FeedbackCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!FeedbackCommonModule.module)
      FeedbackCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.FEEDBACK, schema: FeedbackSchema },
            { name: ModelName.PROFILE, schema: ProfileSchema },
            { name: ModelName.PLAYER, schema: PlayerSchema },
            { name: ModelName.CLAN, schema: ClanSchema },
          ]),
          ClanInventoryModule,
          PlayerModule,
          VotingModule,
          ClanModule,
          RequestHelperModule,
        ],
        providers: [FeedbackService],
      }).compile();

    return FeedbackCommonModule.module;
  }
}
