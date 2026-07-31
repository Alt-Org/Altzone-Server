import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { ModelName } from '../../../common/enum/modelName.enum';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ClanInventoryModule } from '../../../clanInventory/clanInventory.module';
import { FleaMarketItemSchema } from '../../../fleaMarket/fleaMarketItem.schema';
import { BullModule } from '@nestjs/bullmq';
import { PlayerModule } from '../../../player/player.module';
import { VotingModule } from '../../../voting/voting.module';
import { ClanModule } from '../../../clan/clan.module';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import { FleaMarketHelperService } from '../../../fleaMarket/fleaMarketHelper.service';
import { FleaMarketVotingProcessor } from '../../../fleaMarket/fleaMarketVoting.processor';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Clan } from '../../../clan/clan.schema';
import { Player } from '../../../player/schemas/player.schema';
import { Voting } from '../../../voting/schemas/voting.schema';
import { ClanService } from '../../../clan/clan.service';
import { VotingService } from '../../../voting/voting.service';
import { PlayerService } from '../../../player/player.service';
import { VotingQueue } from '../../../voting/voting.queue';
import VotingNotifier from '../../../voting/voting.notifier';
import { VotingQueueName } from '../../../voting/enum/VotingQueue.enum';
import { FleaMarketItemVotingSchema } from '../../../voting/schemas/fleamarketItemVoting.schema';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import { ClanSchema } from '../../../clan/clan.schema';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { forwardRef } from '@nestjs/common';
import { StallService } from '../../../fleaMarket/stall/stall.service';
import { VotingSchema } from '../../../voting/schemas/voting.schema';
import { EventEmitterCommonModule } from '../../../common/service/EventEmitterService/EventEmitterCommon.module';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../common/service/basicService/SEReason';
import { ObjectId } from 'mongodb';

export default class FleaMarketCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!FleaMarketCommonModule.module)
      FleaMarketCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.FLEA_MARKET_ITEM, schema: FleaMarketItemSchema },
            {
              name: ModelName.VOTING,
              schema: VotingSchema,
              discriminators: [
                {
                  name: 'BuyFleaMarketItemVoting',
                  schema: FleaMarketItemVotingSchema,
                  value: VotingType.FLEA_MARKET_BUY_ITEM,
                },
                {
                  name: 'SellFleaMarketItemVoting',
                  schema: FleaMarketItemVotingSchema,
                  value: VotingType.FLEA_MARKET_SELL_ITEM,
                },
                {
                  name: 'ChangeFleaMarketItemPriceVoting',
                  schema: FleaMarketItemVotingSchema,
                  value: VotingType.FLEA_MARKET_CHANGE_ITEM_PRICE,
                },
              ],
            },
            { name: ModelName.CLAN, schema: ClanSchema },
            { name: ModelName.PLAYER, schema: PlayerSchema },
          ]),
          BullModule.registerQueue(
            { name: VotingQueueName.CLAN_ROLE },
            { name: VotingQueueName.CLAN_SHOP },
            { name: VotingQueueName.FLEA_MARKET },
          ),
          ClanInventoryModule,
          RequestHelperModule,
          EventEmitterCommonModule,
        ],
        providers: [
          FleaMarketService,
          FleaMarketHelperService,
          FleaMarketVotingProcessor,
          StallService,
          {
            provide: ClanService,
            useFactory: (clanModel: Model<Clan>) => ({
              model: clanModel,
              readOneById: jest.fn().mockImplementation(async (id, options) => {
                let query = clanModel.findById(id);
                if (options?.includeRefs) {
                  for (const ref of options.includeRefs) {
                    query = query.populate(ref);
                  }
                }
                const result = await query.lean({ virtuals: true }).exec();
                if (!result)
                  return [
                    null,
                    [new ServiceError({ reason: SEReason.NOT_FOUND })],
                  ];
                return [result, null];
              }),
              readAll: jest.fn().mockImplementation(async (options) => {
                const result = await clanModel
                  .find(options?.filter)
                  .lean({ virtuals: true })
                  .exec();
                if (!result || result.length === 0)
                  return [
                    null,
                    [
                      new ServiceError({
                        reason: SEReason.NOT_FOUND,
                        message:
                          'Could not find any objects with specified condition',
                      }),
                    ],
                  ];
                return [result, null];
              }),
              updateOneById: jest
                .fn()
                .mockImplementation(async (id, update) => {
                  const result = await clanModel
                    .findByIdAndUpdate(id, update, { new: true })
                    .lean({ virtuals: true })
                    .exec();
                  return [result, null];
                }),
              updateOne: jest
                .fn()
                .mockImplementation(async (filter, update) => {
                  const result = await clanModel
                    .findOneAndUpdate(filter, update, { new: true })
                    .lean({ virtuals: true })
                    .exec();
                  return [result, null];
                }),
              basicService: {
                readOneById: jest.fn().mockImplementation(async (id) => {
                  const result = await clanModel.findById(id).lean();
                  if (!result)
                    return [
                      null,
                      [new ServiceError({ reason: SEReason.NOT_FOUND })],
                    ];
                  return [result, null];
                }),
                updateOneById: jest
                  .fn()
                  .mockImplementation(async (id, update) => {
                    const result = await clanModel
                      .findByIdAndUpdate(id, update, { new: true })
                      .lean();
                    if (!result)
                      return [
                        null,
                        [new ServiceError({ reason: SEReason.NOT_FOUND })],
                      ];
                    return [result, null];
                  }),
                deleteOneById: jest.fn().mockImplementation(async (id) => {
                  const result = await clanModel.findByIdAndDelete(id).lean();
                  if (!result)
                    return [
                      null,
                      [new ServiceError({ reason: SEReason.NOT_FOUND })],
                    ];
                  return [result, null];
                }),
              },
            }),
            inject: [getModelToken(ModelName.CLAN)],
          },
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
                      dto.voterPlayer?._id || '6a072f5bcba03f65b3faa85b',
                    clan_id: dto.clanId || '6a072f5bcba03f65b3faa85c',
                  },
                };
                if (dto.fleaMarketItem) {
                  votingData.fleaMarketItem_id = dto.fleaMarketItem._id;
                }
                const result = await votingModel.create(votingData);
                return [result, null];
              }),
              finalizeVoting: jest.fn().mockResolvedValue([null, null]),
              basicService: {
                readOneById: jest
                  .fn()
                  .mockImplementation(async (id, options) => {
                    let query = votingModel.findById(id);
                    if (options?.includeRefs) {
                      for (const ref of options.includeRefs) {
                        query = query.populate(ref);
                      }
                    }
                    const result = await query.lean({ virtuals: true }).exec();
                    return [result, null];
                  }),
                deleteOneById: jest.fn().mockImplementation(async (id) => {
                  const result = await votingModel
                    .findByIdAndDelete(id)
                    .lean({ virtuals: true })
                    .exec();
                  return [result, null];
                }),
                updateOneById: jest
                  .fn()
                  .mockImplementation(async (id, update) => {
                    const result = await votingModel
                      .findByIdAndUpdate(id, update, { new: true })
                      .lean({ virtuals: true })
                      .exec();
                    return [result, null];
                  }),
              },
            }),
            inject: [getModelToken(ModelName.VOTING)],
          },
          {
            provide: PlayerService,
            useFactory: (playerModel: Model<Player>) => ({
              model: playerModel,
              readOneById: jest.fn().mockImplementation(async (id, options) => {
                let query = playerModel.findById(id);
                if (options?.includeRefs) {
                  for (const ref of options.includeRefs) {
                    query = query.populate(ref);
                  }
                }
                const result = await query.lean({ virtuals: true }).exec();
                return [result, null];
              }),
              getPlayerById: jest.fn().mockImplementation(async (id) => {
                const result = await playerModel
                  .findById(id)
                  .lean({ virtuals: true })
                  .exec();
                return [result, null];
              }),
            }),
            inject: [getModelToken(ModelName.PLAYER)],
          },
          {
            provide: VotingQueue,
            useValue: { addVotingCheckJob: jest.fn().mockResolvedValue(null) },
          },
          {
            provide: VotingNotifier,
            useValue: { newVoting: jest.fn().mockResolvedValue(null) },
          },
        ],
      }).compile();

    return FleaMarketCommonModule.module;
  }
}
