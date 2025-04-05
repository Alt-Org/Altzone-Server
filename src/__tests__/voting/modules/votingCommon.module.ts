import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ModelName } from '../../../common/enum/modelName.enum';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { PlayerService } from '../../../player/player.service';
import { isPlayerExists } from '../../../player/decorator/validation/IsPlayerExists.decorator';
import { CustomCharacterSchema } from '../../../player/customCharacter/customCharacter.schema';
import { AuthorizationModule } from '../../../authorization/authorization.module';
import { CustomCharacterService } from '../../../player/customCharacter/customCharacter.service';
import { isCustomCharacterExists } from '../../../player/customCharacter/decorator/validation/IsCustomCharacterExists.decorator';
import { ClanSchema } from '../../../clan/clan.schema';
import { RoomSchema } from '../../../clanInventory/room/room.schema';
import { DailyTaskSchema } from '../../../dailyTasks/dailyTasks.schema';
import { VotingSchema } from '../../../voting/schemas/voting.schema';
import { VotingService } from '../../../voting/voting.service';
import VotingNotifier from '../../../voting/voting.notifier';

export default class VotingCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!VotingCommonModule.module)
      VotingCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.VOTING, schema: VotingSchema },
            { name: ModelName.PLAYER, schema: PlayerSchema },
            { name: ModelName.CLAN, schema: ClanSchema },
            { name: ModelName.ROOM, schema: RoomSchema },
            { name: ModelName.CUSTOM_CHARACTER, schema: CustomCharacterSchema },
            { name: ModelName.DAILY_TASK, schema: DailyTaskSchema },
          ]),
          RequestHelperModule,
          AuthorizationModule,
        ],
        providers: [
          VotingService,
          VotingNotifier,
          PlayerService,
          isPlayerExists,
          CustomCharacterService,
          isCustomCharacterExists,
        ],
      }).compile();

    return VotingCommonModule.module;
  }
}
