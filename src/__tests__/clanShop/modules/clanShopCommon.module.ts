import { Test, TestingModule } from '@nestjs/testing';
import { ClanShopScheduler } from '../../../clanShop/clanShop.scheduler';
import { forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { ItemSchema } from '../../../clanInventory/item/item.schema';
import { ClanModule } from '../../../clan/clan.module';
import { VotingModule } from '../../../voting/voting.module';
import { PlayerModule } from '../../../player/player.module';
import ItemModule from '../../clanInventory/modules/item.module';
import { ClanShopService } from '../../../clanShop/clanShop.service';
import { ItemService } from '../../../clanInventory/item/item.service';
import { ClanShopVotingProcessor } from '../../../clanShop/clanShopVoting.processor';
import { ClanSchema } from '../../../clan/clan.schema';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { StockSchema } from '../../../clanInventory/stock/stock.schema';
import { VotingSchema } from '../../../voting/schemas/voting.schema';
import { VotingService } from '../../../voting/voting.service';
import { ClanService } from '../../../clan/clan.service';
import { PlayerService } from '../../../player/player.service';
import { VotingQueue } from '../../../voting/voting.queue';
import { BullModule } from '@nestjs/bullmq';
import { VotingQueueName } from '../../../voting/enum/VotingQueue.enum';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import { BuyClanShopItemVotingSchema } from '../../../voting/schemas/buyShopItem.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Clan } from '../../../clan/clan.schema';
import { Player } from '../../../player/schemas/player.schema';
import { Voting } from '../../../voting/schemas/voting.schema';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../common/service/basicService/SEReason';
import { ObjectId } from 'mongodb';

export default class ClanShopCommonModule {
  private static module: TestingModule;

  static async getModule() {
    if (!ClanShopCommonModule.module)
      ClanShopCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.PLAYER, schema: PlayerSchema },
            { name: ModelName.ITEM, schema: ItemSchema },
            { name: ModelName.CLAN, schema: ClanSchema },
            { name: ModelName.STOCK, schema: StockSchema },
            {
              name: ModelName.VOTING,
              schema: VotingSchema,
              discriminators: [
                {
                  name: 'BuyShopItemVoting',
                  schema: BuyClanShopItemVotingSchema,
                  value: VotingType.SHOP_BUY_ITEM,
                },
              ],
            },
          ]),
          BullModule.registerQueue(
            { name: VotingQueueName.CLAN_ROLE },
            { name: VotingQueueName.CLAN_SHOP },
            { name: VotingQueueName.FLEA_MARKET },
          ),
          PlayerModule,
          ItemModule,
        ],
        providers: [
          ClanShopScheduler,
          ClanShopService,
          ItemService,
          ClanShopVotingProcessor,
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
                const result = await query.lean().exec();
                if (!result)
                  return [
                    null,
                    [new ServiceError({ reason: SEReason.NOT_FOUND })],
                  ];
                return [result, null];
              }),
              readAll: jest.fn().mockImplementation(async (options) => {
                const result = await clanModel.find(options?.filter).lean();
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
                .mockImplementation(async (id, update, options) => {
                  const result = await clanModel
                    .findByIdAndUpdate(id, update, {
                      new: true,
                      session: options?.session,
                    })
                    .lean();
                  if (!result)
                    return [
                      null,
                      [new ServiceError({ reason: SEReason.NOT_FOUND })],
                    ];
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
                  .mockImplementation(async (id, update, options) => {
                    const result = await clanModel
                      .findByIdAndUpdate(id, update, {
                        new: true,
                        session: options?.session,
                      })
                      .lean();
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
                      dto.voterPlayer?._id || new ObjectId().toString(),
                    clan_id: dto.clanId || new ObjectId().toString(),
                  },
                };
                if (dto.shopItem) {
                  votingData.shopItemName = dto.shopItem;
                }
                const result = await votingModel.create(votingData);
                return [result, null];
              }),
              finalizeVoting: jest.fn().mockResolvedValue([null, null]),
              basicService: {
                readOneById: jest
                  .fn()
                  .mockImplementation(async (id, options) => {
                    const result = await votingModel
                      .findById(id)
                      .session(options?.session || null)
                      .lean();
                    if (!result)
                      return [
                        null,
                        [new ServiceError({ reason: SEReason.NOT_FOUND })],
                      ];
                    return [result, null];
                  }),
                deleteOneById: jest
                  .fn()
                  .mockImplementation(async (id, options) => {
                    const result = await votingModel
                      .findByIdAndDelete(id, { session: options?.session })
                      .lean();
                    if (!result)
                      return [
                        null,
                        [new ServiceError({ reason: SEReason.NOT_FOUND })],
                      ];
                    return [result, null];
                  }),
                updateOneById: jest
                  .fn()
                  .mockImplementation(async (id, update, options) => {
                    const result = await votingModel
                      .findByIdAndUpdate(id, update, {
                        new: true,
                        session: options?.session,
                      })
                      .lean();
                    if (!result)
                      return [
                        null,
                        [new ServiceError({ reason: SEReason.NOT_FOUND })],
                      ];
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
                const result = await playerModel
                  .findById(id)
                  .session(options?.session || null)
                  .lean();
                if (!result)
                  return [
                    null,
                    [new ServiceError({ reason: SEReason.NOT_FOUND })],
                  ];
                return [result, null];
              }),
              getPlayerById: jest
                .fn()
                .mockImplementation(async (id, options) => {
                  const result = await playerModel
                    .findById(id)
                    .session(options?.session || null)
                    .lean();
                  if (!result)
                    return [
                      null,
                      [new ServiceError({ reason: SEReason.NOT_FOUND })],
                    ];
                  return [result, null];
                }),
            }),
            inject: [getModelToken(ModelName.PLAYER)],
          },
          {
            provide: VotingQueue,
            useValue: { addVotingCheckJob: jest.fn().mockResolvedValue(null) },
          },
        ],
      }).compile();

    return ClanShopCommonModule.module;
  }
}
