import { MongooseError } from 'mongoose';
import { ObjectId } from 'mongodb';
import PlayerBuilderFactory from '../data/playerBuilderFactory';
import PlayerModule from '../modules/player.module';
import { PlayerService } from '../../../player/player.service';
import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';

describe('PlayerService.createOne() test suite', () => {
  let playerService: PlayerService;
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');

  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    playerService = await PlayerModule.getPlayerService();
  });

  it('Should create a player in DB if input is valid', async () => {
    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();

    await playerService.createOne(playerToCreate);

    const dbData = await playerModel.findOne({ name: playerName });

    const clearedResp = clearDBRespDefaultFields(dbData);

    const { profile_id: _profile_id, ...expectedPlayer } = {
      ...playerToCreate,
      points: 0,
    };

    expect(clearedResp).toEqual(expect.objectContaining(expectedPlayer));
  });

  it('Should create a player in DB if input is valid and battleCharacterId values are null or ObjectId', async () => {
    const playerName = 'john';
    const playerToCreate = playerBuilder
      .setBattleCharacterIds([null, new ObjectId()])
      .setName(playerName)
      .build();

    await playerService.createOne(playerToCreate);

    const dbData = await playerModel.findOne({ name: playerName });

    const clearedResp = clearDBRespDefaultFields(dbData);

    const { profile_id: _profile_id, ...expectedPlayer } = {
      ...playerToCreate,
      points: 0,
    };

    expect(clearedResp).toEqual(expect.objectContaining(expectedPlayer));
  });

  it('Should create a player in DB if input is valid and battleCharacterIds is null', async () => {
    const playerName = 'john';
    const playerToCreate = playerBuilder
      .setBattleCharacterIds(null)
      .setName(playerName)
      .build();

    await playerService.createOne(playerToCreate);

    const dbData = await playerModel.findOne({ name: playerName });

    const clearedResp = clearDBRespDefaultFields(dbData);

    const { profile_id: _profile_id, ...expectedPlayer } = {
      ...playerToCreate,
      points: 0,
    };

    expect(clearedResp).toEqual(expect.objectContaining(expectedPlayer));
  });

  it('Should return response in appropriate shape', async () => {
    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();

    const resp = await playerService.createOne(playerToCreate);

    const data = resp['data']['Player'];
    const clearedData = clearDBRespDefaultFields(data);

    const { profile_id: _, ...expectedFields } = playerToCreate;
    expect(clearedData).toEqual(
      expect.objectContaining({
        ...expectedFields,
        _id: expect.any(ObjectId),
        points: expect.any(Number),
      }),
    );

    expect(resp['metaData']).toEqual({
      dataKey: 'Player',
      modelName: 'Player',
      dataType: 'Object',
      dataCount: 1,
    });
  });

  it('Should not create player in DB if input is invalid', async () => {
    const invalidPlayer = playerBuilder.setName(undefined).build();

    try {
      await playerService.createOne(invalidPlayer);
    } catch (e) {
      void e;
    }

    const dbData1 = await playerModel.findOne({ name: false });
    const dbData2 = await playerModel.findOne({ name: 'false' });

    expect(dbData1).toBeNull();
    expect(dbData2).toBeNull();
  });

  it('Should throw validation error if input is not valid', async () => {
    const invalidPlayer = playerBuilder.setName(undefined).build();

    await expect(playerService.createOne(invalidPlayer)).rejects.toThrow(
      MongooseError,
    );
  });

  it('Should throw Mongoose not unique error if player with such name already exists', async () => {
    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();

    await playerService.createOne(playerToCreate);

    try {
      await playerService.createOne(playerToCreate);
    } catch (e: any) {
      expect(e.code).toBe(11000);
      expect(e.name).toMatch(/MongoServerError|MongoError|BulkWriteError/);
    }
  });

  it('Should not create player if player with such name already exists', async () => {
    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();

    await playerService.createOne(playerToCreate);
    const { _id: _idBefore } = await playerModel.findOne({ name: playerName });

    try {
      await playerService.createOne(playerToCreate);
    } catch (e) {
      void e;
    }

    const { _id: _idAfter } = await playerModel.findOne({ name: playerName });

    expect(_idBefore.toString()).toBe(_idAfter.toString());
  });
});
