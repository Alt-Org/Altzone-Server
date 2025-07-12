import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { ProfileSchema } from '../profile/profile.schema';
import { ProfileModule } from '../profile/profile.module';
import { FeedbackController } from './feedback.controller';
import { PlayerSchema } from '../player/schemas/player.schema';
import { PlayerModule } from '../player/player.module';
import { ClanSchema } from '../clan/clan.schema';
import { FeedbackSchema } from './feedback.schema';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [
    MongooseModule.forFeature([
       { name: ModelName.FEEDBACK, schema: FeedbackSchema },
      { name: ModelName.PROFILE, schema: ProfileSchema },
      { name: ModelName.PLAYER, schema: PlayerSchema },
      { name: ModelName.CLAN, schema: ClanSchema },
    ]),
    ProfileModule,
    PlayerModule,
    RequestHelperModule,
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [],
})
export class FeedbackModule {}
