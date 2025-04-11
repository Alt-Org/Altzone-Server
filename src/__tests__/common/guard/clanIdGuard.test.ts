import { ClanIdGuard } from '../../../common/guard/clanId.guard';
import { Player, PlayerSchema } from '../../../player/schemas/player.schema';
import { APIError } from '../../../common/controller/APIError';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import LoggedUser from '../../test_utils/const/loggedUser';
import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import TestUtilDataFactory from '../../test_utils/data/TestUtilsDataFactory';

describe('@ClanIdGuard() test suite', () => {
  let guard: ClanIdGuard;
  let playerModel: mongoose.Model<Player>;
  const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClanIdGuard,
        {
          provide: getModelToken(Player.name),
          useValue: mongoose.model(Player.name, PlayerSchema),
        },
      ],
    }).compile();

    guard = module.get<ClanIdGuard>(ClanIdGuard);
    playerModel = module.get<mongoose.Model<Player>>(
      getModelToken(Player.name),
    );
  });

  it('Should throw an error if user is not authenticated', async () => {
    const request = { user: null };
    const mockExecutionContext = contextBuilder.setHttpRequest(request).build();

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      new APIError({
        reason: APIErrorReason.MISCONFIGURED,
        field: 'user',
        value: null,
        message: 'The ClanIdGuard requires an authenticated user.',
      }),
    );
  });

  it('Should throw an error if player is not found in the database', async () => {
    const request = { user: { player_id: new mongoose.Types.ObjectId() } };
    const mockExecutionContext = contextBuilder.setHttpRequest(request).build();

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      new APIError({
        reason: APIErrorReason.NOT_FOUND,
        message: 'Player not found.',
      }),
    );
  });

  it('Should throw an error if player is not a member of a clan', async () => {
    const loggedPlayer = LoggedUser.getPlayer();
    const request = { user: { player_id: loggedPlayer._id } };
    const mockExecutionContext = contextBuilder.setHttpRequest(request).build();

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      new APIError({
        reason: APIErrorReason.NOT_AUTHORIZED,
        message: 'Player is not a member of a clan.',
      }),
    );
  });

  it('Should return true if player is a member of a clan', async () => {
    const loggedPlayer = LoggedUser.getPlayer();
    const clanId = new ObjectId().toString();

    await playerModel.updateOne(
      { _id: loggedPlayer._id },
      { $set: { clan_id: clanId } },
    );

    const request = {
      user: { player_id: loggedPlayer._id, clan_id: undefined },
    };
    const mockExecutionContext = contextBuilder.setHttpRequest(request).build();

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
  });

  it('Should set clan_id field of the User if player is a member of a clan', async () => {
    const loggedPlayer = LoggedUser.getPlayer();
    const clanId = new ObjectId().toString();

    await playerModel.updateOne(
      { _id: loggedPlayer._id },
      { $set: { clan_id: clanId } },
    );

    const request = {
      user: { player_id: loggedPlayer._id, clan_id: undefined },
    };
    const mockExecutionContext = contextBuilder.setHttpRequest(request).build();

    await guard.canActivate(mockExecutionContext);

    expect(request.user.clan_id).toEqual(clanId);
  });
});
