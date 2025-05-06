import { HasClanRightsGuard } from '../../../../../../clan/role/decorator/guard/HasClanRights';
import PlayerModule from '../../../../../player/modules/player.module';
import ClanModule from '../../../../modules/clan.module';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import TestUtilDataFactory from '../../../../../test_utils/data/TestUtilsDataFactory';
import AuthBuilderFactory from '../../../../../auth/data/authBuilderFactory';
import PlayerBuilderFactory from '../../../../../player/data/playerBuilderFactory';
import ClanBuilderFactory from '../../../../data/clanBuilderFactory';
import { ClanBasicRight } from '../../../../../../clan/role/enum/clanBasicRight.enum';
import { APIErrorReason } from '../../../../../../common/controller/APIErrorReason';
import { getNonExisting_id } from '../../../../../test_utils/util/getNonExisting_id';
import { MongooseModule } from '@nestjs/mongoose';
import {
  mongooseOptions,
  mongoString,
} from '../../../../../test_utils/const/db';
import { ModelName } from '../../../../../../common/enum/modelName.enum';
import { ClanSchema } from '../../../../../../clan/clan.schema';
import { PlayerSchema } from '../../../../../../player/schemas/player.schema';
import { ObjectId } from 'mongodb';
import {
  APIError,
  APIErrorArray,
} from '../../../../../../common/controller/APIError';

describe('HasClanRightsGuard.canActivate() test suite', () => {
  let guard: HasClanRightsGuard;

  const requiredRights: ClanBasicRight[] = [
    ClanBasicRight.MANAGE_ROLE,
    ClanBasicRight.EDIT_CLAN_DATA,
  ];

  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const existingPlayer = playerBuilder.build();
  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanRoleBuilder = ClanBuilderFactory.getBuilder('ClanRole');

  const existingClan = clanBuilder.build();

  let reflector: Reflector;

  const userBuilder = AuthBuilderFactory.getBuilder('User');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoString, mongooseOptions),
        MongooseModule.forFeature([
          { name: ModelName.CLAN, schema: ClanSchema },
          { name: ModelName.PLAYER, schema: PlayerSchema },
        ]),
      ],
      providers: [HasClanRightsGuard, Reflector],
    }).compile();

    const clanResp = await clanModel.create(existingClan);
    existingClan._id = clanResp._id.toString();

    existingPlayer.clan_id = clanResp._id;
    const playerResp = await playerModel.create(existingPlayer);
    existingPlayer._id = playerResp._id.toString();

    guard = module.get(HasClanRightsGuard);
    reflector = module.get(Reflector);
    jest.spyOn(reflector, 'get').mockReturnValue(requiredRights);
  });

  it('Should return true if player is in a clan and has all the required rights', async () => {
    await addRoleToPlayer(existingPlayer._id, 'role-1', requiredRights);
    const user = userBuilder.setPlayerId(existingPlayer._id.toString()).build();
    const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');
    const context = contextBuilder.setHttpRequest({ user }).build();

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('Should throw APIError NOT_AUTHORIZED if player has not all required rights', async () => {
    await addRoleToPlayer(existingPlayer._id, 'role-1', [requiredRights[0]]);
    const user = userBuilder.setPlayerId(existingPlayer._id.toString()).build();
    const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');
    const context = contextBuilder.setHttpRequest({ user }).build();

    await expect(guard.canActivate(context)).rejects.toEqual(
      new APIErrorArray([
        new APIError({
          reason: APIErrorReason.NOT_AUTHORIZED,
          field: 'rights',
          value: requiredRights[1],
          message: 'Logged-in player role does not have all required rights',
        }),
      ]),
    );
  });

  it('Should throw APIError NOT_AUTHORIZED if player has no rights at all', async () => {
    await addRoleToPlayer(existingPlayer._id, 'role-1', []);
    const user = userBuilder.setPlayerId(existingPlayer._id.toString()).build();
    const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');
    const context = contextBuilder.setHttpRequest({ user }).build();

    await expect(guard.canActivate(context)).rejects.toMatchObject(
      new APIErrorArray([
        new APIError({
          reason: APIErrorReason.NOT_AUTHORIZED,
          field: 'rights',
          value: requiredRights[0],
          message: 'Logged-in player role does not have all required rights',
        }),
        new APIError({
          reason: APIErrorReason.NOT_AUTHORIZED,
          field: 'rights',
          value: requiredRights[1],
          message: 'Logged-in player role does not have all required rights',
        }),
      ]),
    );
  });

  it('Should throw APIError MISCONFIGURED if Request does not have a user object', async () => {
    const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');
    const context = contextBuilder.build();

    await expect(guard.canActivate(context)).rejects.toThrow();

    try {
      await guard.canActivate(context);
    } catch (e: any) {
      expect(e.reason).toBe(APIErrorReason.MISCONFIGURED);
      expect(e.field).toBe('user');
      expect(e.value).toBeNull();
    }
  });

  it('Should throw APIError NOT_FOUND if player does not exists', async () => {
    const nonExisting_id = getNonExisting_id();
    const user = userBuilder.setPlayerId(nonExisting_id).build();
    const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');
    const context = contextBuilder.setHttpRequest({ user }).build();

    await expect(guard.canActivate(context)).rejects.toThrow();

    try {
      await guard.canActivate(context);
    } catch (e: any) {
      expect(e.reason).toBe(APIErrorReason.NOT_FOUND);
      expect(e.field).toBe('player_id');
      expect(e.value).toBe(nonExisting_id);
    }
  });

  it('Should throw APIError NOT_AUTHORIZED if player is not in any clan', async () => {
    await playerModel.findByIdAndUpdate(existingPlayer._id, { clan_id: null });
    const user = userBuilder.setPlayerId(existingPlayer._id.toString()).build();
    const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');
    const context = contextBuilder.setHttpRequest({ user }).build();

    await expect(guard.canActivate(context)).rejects.toThrow();

    try {
      await guard.canActivate(context);
    } catch (e: any) {
      expect(e.reason).toBe(APIErrorReason.NOT_AUTHORIZED);
      expect(e.field).toBe('clan_id');
      expect(e.value).toBeNull();
    }
  });

  it('Should throw APIError NOT_FOUND if clan does not exists', async () => {
    await addRoleToPlayer(existingPlayer._id, 'role-1', requiredRights);
    await clanModel.findByIdAndDelete(existingClan._id);
    const user = userBuilder.setPlayerId(existingPlayer._id.toString()).build();
    const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');
    const context = contextBuilder.setHttpRequest({ user }).build();

    await expect(guard.canActivate(context)).rejects.toThrow();

    try {
      await guard.canActivate(context);
    } catch (e: any) {
      expect(e.reason).toBe(APIErrorReason.NOT_FOUND);
      expect(e.field).toBe('clan_id');
      expect(e.value).toBe(existingClan._id);
    }
  });

  async function addRoleToPlayer(
    player_id: string | ObjectId,
    roleName: string,
    roleRights: ClanBasicRight[],
  ) {
    const roleToCreate = clanRoleBuilder
      .setName(roleName)
      .setRights(
        roleRights.reduce((roleRights, rightToAdd) => {
          roleRights[rightToAdd] = true;
          return roleRights;
        }, {}),
      )
      .build();

    const player = await playerModel.findById(player_id);

    await clanModel.findByIdAndUpdate(player.clan_id, {
      $push: { roles: [roleToCreate] },
    });

    const clanResp = await clanModel.findById(player.clan_id);

    const role = clanResp.roles.find((role) => role.name === roleName);
    await playerModel.findByIdAndUpdate(player._id, {
      clanRole_id: role._id,
    });
  }
});
