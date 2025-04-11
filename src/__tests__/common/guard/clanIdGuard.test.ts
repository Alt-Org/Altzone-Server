import { ClanIdGuard } from '../../../common/guard/clanId.guard';
import { ExecutionContext } from '@nestjs/common';
import { Player, PlayerSchema } from '../../../player/schemas/player.schema';
import { APIError } from '../../../common/controller/APIError';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import LoggedUser from '../../test_utils/const/loggedUser';
import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

describe('ClanIdGuard (with DB)', () => {
  let guard: ClanIdGuard;
  let playerModel: mongoose.Model<Player>;
  let mockExecutionContext: Partial<ExecutionContext>;

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

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    };
  });

  it('should throw an error if user is not authenticated', async () => {
    const request = { user: null };
    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue(request);

    await expect(
      guard.canActivate(mockExecutionContext as ExecutionContext),
    ).rejects.toThrow(
      new APIError({
        reason: APIErrorReason.MISCONFIGURED,
        field: 'user',
        value: null,
        message: 'The ClanIdGuard requires an authenticated user.',
      }),
    );
  });

  it('should throw an error if player is not found in the database', async () => {
    const request = { user: { player_id: new mongoose.Types.ObjectId() } };
    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue(request);

    await expect(
      guard.canActivate(mockExecutionContext as ExecutionContext),
    ).rejects.toThrow(
      new APIError({
        reason: APIErrorReason.NOT_FOUND,
        message: 'Player not found.',
      }),
    );
  });

  it('should throw an error if player is not a member of a clan', async () => {
    const loggedPlayer = LoggedUser.getPlayer();
    const request = { user: { player_id: loggedPlayer._id } };
    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue(request);

    await expect(
      guard.canActivate(mockExecutionContext as ExecutionContext),
    ).rejects.toThrow(
      new APIError({
        reason: APIErrorReason.NOT_AUTHORIZED,
        message: 'Player is not a member of a clan.',
      }),
    );
  });

  it('should allow access if player is a member of a clan', async () => {
    const loggedPlayer = LoggedUser.getPlayer();
    const clanId = new ObjectId().toString();

    await playerModel.updateOne(
      { _id: loggedPlayer._id },
      { $set: { clan_id: clanId } },
    );

    const request = {
      user: { player_id: loggedPlayer._id, clan_id: undefined },
    };
    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue(request);

    const result = await guard.canActivate(
      mockExecutionContext as ExecutionContext,
    );

    expect(result).toBe(true);
    expect(request.user.clan_id).toEqual(clanId);
  });
});
