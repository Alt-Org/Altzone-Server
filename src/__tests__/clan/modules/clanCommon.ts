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
import mongoose, { Model } from 'mongoose';
import { Voting } from '../../../voting/schemas/voting.schema';
import { Player } from '../../../player/schemas/player.schema';
import { BullModule } from '@nestjs/bullmq';
import { PlayerService } from '../../../player/player.service';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../common/service/basicService/SEReason';
import { ObjectId } from 'mongodb';

export default class ClanCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!ClanCommonModule.module)
      ClanCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.CLAN, schema: ClanSchema },
            { name: ModelName.PLAYER, schema: PlayerSchema },
            {
              name: ModelName.VOTING,
              schema: VotingSchema,
              discriminators: [
                {
                  name: 'SetClanRoleVoting',
                  schema: SetClanRoleVotingSchema,
                  value: VotingType.SET_CLAN_ROLE,
                },
              ],
            },
          ]),
          BullModule.registerQueue(
            { name: VotingQueueName.CLAN_ROLE },
            { name: VotingQueueName.CLAN_SHOP },
            { name: VotingQueueName.FLEA_MARKET },
          ),
          ClanInventoryModule,
          RequestHelperModule,
          GameEventsEmitterModule,
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
            provide: VotingService,
            useFactory: (votingModel: Model<Voting>) => ({
              model: votingModel,
              checkVotingSuccess: jest
                .fn()
                .mockImplementation(async (voting) => {
                  const yesVotes =
                    voting.votes?.filter((v) => v.choice === 'accept').length ||
                    0;
                  const totalVotes = voting.votes?.length || 0;
                  if (totalVotes === 0) return false;
                  return (yesVotes / totalVotes) * 100 >= 51;
                }),
              startVoting: jest.fn().mockImplementation(async (dto) => {
                const votingData = {
                  ...dto,
                  organizer: {
                    player_id:
                      dto.voterPlayer?._id || new ObjectId().toString(),
                    clan_id: dto.clanId || new ObjectId().toString(),
                  },
                };
                const result = await votingModel.create(votingData);
                return [result, null];
              }),
              finalizeVoting: jest.fn().mockResolvedValue([null, null]),
              basicService: {
                readOneById: jest.fn().mockImplementation(async (id) => {
                  const result = await votingModel.findById(id).lean();
                  return [result, null];
                }),
                deleteOneById: jest.fn().mockImplementation(async (id) => {
                  const result = await votingModel.findByIdAndDelete(id).lean();
                  return [result, null];
                }),
                updateOneById: jest
                  .fn()
                  .mockImplementation(async (id, update) => {
                    const result = await votingModel
                      .findByIdAndUpdate(id, update, { new: true })
                      .lean();
                    return [result, null];
                  }),
              },
            }),
            inject: [getModelToken(ModelName.VOTING)],
          },
          {
            provide: VotingQueue,
            useValue: { addVotingCheckJob: jest.fn().mockResolvedValue(null) },
          },
          {
            provide: VotingNotifier,
            useValue: { newVoting: jest.fn().mockResolvedValue(null) },
          },
          {
            provide: PlayerService,
            useFactory: (playerModel: Model<Player>) => ({
              model: playerModel,
              readOneById: jest.fn().mockImplementation(async (id) => {
                const result = await playerModel.findById(id).lean();
                return [result, null];
              }),
              getPlayerById: jest.fn().mockImplementation(async (id) => {
                const result = await playerModel.findById(id).lean();
                return [result, null];
              }),
            }),
            inject: [getModelToken(ModelName.PLAYER)],
          },
        ],
      }).compile();

    return ClanCommonModule.module;
  }

  static async close() {
    if (ClanCommonModule.module) {
      try {
        await ClanCommonModule.module.close();

        if (mongoose.connection && mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        if ((error as any)?.name !== 'MongoClientClosedError') {
          console.error('Error during database disconnection:', error);
        }
      } finally {
        ClanCommonModule.module = null;
      }
    }
  }
}