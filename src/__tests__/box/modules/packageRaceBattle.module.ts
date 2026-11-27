import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ModelName } from '../../../common/enum/modelName.enum';
import { BoxSchema } from '../../../box/schemas/box.schema';
import { GroupAdminSchema } from '../../../box/groupAdmin/groupAdmin.schema';
import { ProfileSchema } from '../../../profile/profile.schema';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { ClanSchema } from '../../../clan/clan.schema';
import { RoomSchema } from '../../../clanInventory/room/room.schema';
import { ClanModule } from '../../../clan/clan.module';
import { PlayerModule } from '../../../player/player.module';
import { BoxService } from '../../../box/box.service';
import { BoxHelper } from '../../../box/util/boxHelper';
import {
  PackageRaceBattleResult,
  PackageRaceBattleResultSchema,
} from '../../../box/packageRace/battle/packageRaceBattleResult.schema';
import { PackageRaceBattleRewarder } from '../../../box/packageRace/battle/packageRaceBattleRewarder.service';

/**
 * Test module of the package race battle rewarder
 * (the providers it gets from the matchmaking module).
 */
export default class PackageRaceBattleModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!PackageRaceBattleModule.module)
      PackageRaceBattleModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.BOX, schema: BoxSchema },
            { name: ModelName.GROUP_ADMIN, schema: GroupAdminSchema },
            { name: ModelName.PROFILE, schema: ProfileSchema },
            { name: ModelName.PLAYER, schema: PlayerSchema },
            { name: ModelName.CLAN, schema: ClanSchema },
            { name: ModelName.ROOM, schema: RoomSchema },
            {
              name: PackageRaceBattleResult.name,
              schema: PackageRaceBattleResultSchema,
            },
          ]),
          ClanModule,
          PlayerModule,
        ],
        providers: [BoxService, BoxHelper, PackageRaceBattleRewarder],
      }).compile();

    return PackageRaceBattleModule.module;
  }
}
