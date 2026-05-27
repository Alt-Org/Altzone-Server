import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef } from '@nestjs/common';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { ModelName } from '../../../common/enum/modelName.enum';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ClanInventoryModule } from '../../../clanInventory/clanInventory.module';
import { ClanSchema } from '../../../clan/clan.schema';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import ClanHelperService from '../../../clan/utils/clanHelper.service';
import { JoinService } from '../../../clan/join/join.service';
import { ClanService } from '../../../clan/clan.service';
import { isClanExists } from '../../../clan/decorator/validation/IsClanExists.decorator';
import { PlayerCounterFactory } from '../../../clan/clan.counters';
import { GameEventsEmitterModule } from '../../../gameEventsEmitter/gameEventsEmitter.module';
import ClanRoleService from '../../../clan/role/clanRole.service';
import { ClanRoleVotingProcessor } from '../../../clan/role/clanRole.processor';
import { PasswordGenerator } from '../../../common/function/passwordGenerator';
import { VotingService } from '../../../voting/voting.service';
import { VotingQueue } from '../../../voting/voting.queue';
import VotingNotifier from '../../../voting/voting.notifier';
import { VotingSchema } from '../../../voting/schemas/voting.schema';
import { VotingQueueName } from '../../../voting/enum/VotingQueue.enum';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import { SetClanRoleVotingSchema } from '../../../voting/schemas/setClanRoleVoting.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Voting } from '../../../voting/schemas/voting.schema';
import { Player } from '../../../player/schemas/player.schema';
import { BullModule } from '@nestjs/bullmq';
import { PlayerService } from '../../../player/player.service';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../common/service/basicService/SEReason';
import { ObjectId } from 'mongodb';
import { VotingModule } from '../../../voting/voting.module';
import { PlayerModule } from '../../../player/player.module';
import { EventEmitterCommonModule } from '../../../common/service/EventEmitterService/EventEmitterCommon.module';

export default class ClanCommonModule {
  private constructor() { }

  private static module: TestingModule;

  static async getModule() {
    if (!ClanCommonModule.module)
      ClanCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.CLAN, schema: ClanSchema },
            { name: ModelName.PLAYER, schema: PlayerSchema },
          ]),
          ClanInventoryModule,
          RequestHelperModule,
          GameEventsEmitterModule,
          EventEmitterCommonModule,
          PlayerModule,
          VotingModule,
        ],
        providers: [
          ClanService,
          isClanExists,
          PlayerCounterFactory,
          ClanHelperService,
          JoinService,
          ClanRoleService,
          ClanRoleVotingProcessor,
          PasswordGenerator,
          {
            provide: VotingQueue,
            useValue: { addVotingCheckJob: jest.fn().mockResolvedValue(null) },
          },
          {
            provide: VotingNotifier,
            useValue: {
              newVoting: jest.fn().mockResolvedValue(null),
              votingUpdated: jest.fn().mockResolvedValue(null),
            },
          },
        ],
      }).compile();

    return ClanCommonModule.module;
  }
}
