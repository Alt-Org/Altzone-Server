import { ObjectId } from 'mongodb';
import BoxModule from '../../modules/box.module';
import ClanModule from '../../../clan/modules/clan.module';
import PlayerModule from '../../../player/modules/player.module';
import PackageRaceBattleModule from '../../modules/packageRaceBattle.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import { PackageRaceBattleRewarder } from '../../../../box/packageRace/battle/packageRaceBattleRewarder.service';
import { TeamSide } from '../../../../matchmaking/enum/teamSide.enum';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import { uniqueName } from '../../data/packageRace/startedBox';
import { createBoxPlayer } from '../../data/packageRace/sessionTask';
import {
  createBattleBox,
  createRewarderWithMocks,
} from '../../data/packageRace/battle';
import { PackageRaceBattlePlayer } from '../../../../box/packageRace/battle/packageRaceBattle.type';

describe('PackageRaceBattleRewarder.readBattleTeams() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let rewarder: PackageRaceBattleRewarder;

  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();
  const playerModel = PlayerModule.getPlayerModel();

  const battlePlayers = (
    winnerId: string,
    loserId: string,
  ): [PackageRaceBattlePlayer, PackageRaceBattlePlayer] => [
    { playerId: winnerId, side: TeamSide.A, outcome: 'WIN' },
    { playerId: loserId, side: TeamSide.B, outcome: 'LOSS' },
  ];

  const readBattleTeams = (winnerId: string, loserId: string) =>
    rewarder['readBattleTeams'](battlePlayers(winnerId, loserId), null);

  beforeEach(async () => {
    const module = await PackageRaceBattleModule.getModule();
    rewarder = module.get(PackageRaceBattleRewarder);
  });

  afterEach(async () => {
    await Promise.all([
      boxModel.deleteMany(),
      clanModel.deleteMany(),
      playerModel.deleteMany(),
    ]);
  });

  it('Should return the box and the teams of both players', async () => {
    const { box_id, blueTeam, redTeam, bluePlayer, redPlayer } =
      await createBattleBox();

    const [battle, errors] = await readBattleTeams(redPlayer, bluePlayer);

    expect(errors).toBeNull();
    expect(battle).toEqual({
      boxId: box_id,
      teams: [
        {
          playerId: redPlayer,
          side: TeamSide.A,
          outcome: 'WIN',
          teamId: redTeam.toString(),
        },
        {
          playerId: bluePlayer,
          side: TeamSide.B,
          outcome: 'LOSS',
          teamId: blueTeam.toString(),
        },
      ],
    });
  });

  it('Should keep the order of the given players', async () => {
    const { blueTeam, redTeam, bluePlayer, redPlayer } =
      await createBattleBox();

    const [battle] = await readBattleTeams(bluePlayer, redPlayer);

    expect(battle.teams.map((team) => team.teamId)).toEqual([
      blueTeam.toString(),
      redTeam.toString(),
    ]);
  });

  it('Should return both players with the same team if they are teammates', async () => {
    const { box_id, redTeam, redPlayer } = await createBattleBox();
    const teammate = await createBoxPlayer(box_id, redTeam);

    const [battle, errors] = await readBattleTeams(redPlayer, teammate);

    expect(errors).toBeNull();
    expect(battle.teams.map((team) => team.teamId)).toEqual([
      redTeam.toString(),
      redTeam.toString(),
    ]);
  });

  it('Should return null if a player _id is not a valid ObjectId', async () => {
    const { redPlayer } = await createBattleBox();

    expect(await readBattleTeams(redPlayer, 'player-2')).toEqual([null, null]);
  });

  it('Should return null if a player does not exist', async () => {
    const { redPlayer } = await createBattleBox();

    expect(await readBattleTeams(redPlayer, new ObjectId().toString())).toEqual(
      [null, null],
    );
  });

  it('Should return null if neither player exists', async () => {
    expect(
      await readBattleTeams(
        new ObjectId().toString(),
        new ObjectId().toString(),
      ),
    ).toEqual([null, null]);
  });

  it('Should return null if a player does not belong to a box', async () => {
    const { redPlayer } = await createBattleBox();
    const regularPlayer = await playerModel.create(
      PlayerBuilderFactory.getBuilder('Player')
        .setName(uniqueName('regular-player'))
        .setUniqueIdentifier(uniqueName('regular-device'))
        .build(),
    );

    expect(
      await readBattleTeams(redPlayer, regularPlayer._id.toString()),
    ).toEqual([null, null]);
  });

  it('Should return null if a player of the box has no team', async () => {
    const { box_id, redPlayer } = await createBattleBox();
    const playerWithoutTeam = await playerModel.create({
      ...PlayerBuilderFactory.getBuilder('Player')
        .setName(uniqueName('no-team'))
        .setUniqueIdentifier(uniqueName('no-team-device'))
        .build(),
      clan_id: null,
      box_id,
    });

    expect(
      await readBattleTeams(redPlayer, playerWithoutTeam._id.toString()),
    ).toEqual([null, null]);
  });

  it('Should return null if the players belong to different box sessions', async () => {
    const { redPlayer } = await createBattleBox();
    const otherBox = await createBattleBox();

    expect(await readBattleTeams(redPlayer, otherBox.bluePlayer)).toEqual([
      null,
      null,
    ]);
  });

  it('Should return null if the team of a player belongs to another box', async () => {
    const { box_id, redPlayer } = await createBattleBox();
    const otherBox = await createBattleBox();
    const playerInOtherBoxTeam = await createBoxPlayer(
      box_id,
      otherBox.blueTeam,
    );

    expect(await readBattleTeams(redPlayer, playerInOtherBoxTeam)).toEqual([
      null,
      null,
    ]);
  });

  it('Should return null if the team of a player is not a box team', async () => {
    const { box_id, redPlayer } = await createBattleBox();
    const regularClan = await clanModel.create(
      ClanBuilderFactory.getBuilder('Clan')
        .setName(uniqueName('regular-clan'))
        .build(),
    );
    const player = await createBoxPlayer(
      box_id,
      new ObjectId(regularClan._id.toString()),
    );

    expect(await readBattleTeams(redPlayer, player)).toEqual([null, null]);
  });

  it('Should return null if the team of a player does not exist', async () => {
    const { box_id, redPlayer } = await createBattleBox();
    const player = await createBoxPlayer(box_id, new ObjectId());

    expect(await readBattleTeams(redPlayer, player)).toEqual([null, null]);
  });

  describe('Service errors', () => {
    const validId = () => new ObjectId().toString();
    const unexpectedError = new ServiceError({ reason: SEReason.UNEXPECTED });
    const notFoundError = new ServiceError({ reason: SEReason.NOT_FOUND });

    it('Should return the errors if reading the players fails', async () => {
      const mocks = createRewarderWithMocks();
      mocks.playerService.basicService.readMany.mockResolvedValue([
        null,
        [unexpectedError],
      ]);

      const result = await mocks.rewarder['readBattleTeams'](
        battlePlayers(validId(), validId()),
        null,
      );

      expect(result).toEqual([null, [unexpectedError]]);
      expect(mocks.clanService.basicService.readMany).not.toHaveBeenCalled();
    });

    it('Should return the errors if reading the teams fails', async () => {
      const mocks = createRewarderWithMocks();
      const [winnerId, loserId] = [validId(), validId()];
      mocks.playerService.basicService.readMany.mockResolvedValue([
        [
          { _id: winnerId, clan_id: validId(), box_id: 'box-1' },
          { _id: loserId, clan_id: validId(), box_id: 'box-1' },
        ],
        null,
      ]);
      mocks.clanService.basicService.readMany.mockResolvedValue([
        null,
        [unexpectedError],
      ]);

      const result = await mocks.rewarder['readBattleTeams'](
        battlePlayers(winnerId, loserId),
        null,
      );

      expect(result).toEqual([null, [unexpectedError]]);
    });

    it('Should read the players and teams in the given session', async () => {
      const mocks = createRewarderWithMocks();
      const session = { id: 'session' } as any;
      const [winnerId, loserId] = [validId(), validId()];
      mocks.playerService.basicService.readMany.mockResolvedValue([
        [
          { _id: winnerId, clan_id: validId(), box_id: 'box-1' },
          { _id: loserId, clan_id: validId(), box_id: 'box-1' },
        ],
        null,
      ]);
      mocks.clanService.basicService.readMany.mockResolvedValue([
        null,
        [notFoundError],
      ]);

      await mocks.rewarder['readBattleTeams'](
        battlePlayers(winnerId, loserId),
        session,
      );

      expect(mocks.playerService.basicService.readMany).toHaveBeenCalledWith(
        expect.objectContaining({ session }),
      );
      expect(mocks.clanService.basicService.readMany).toHaveBeenCalledWith(
        expect.objectContaining({ session }),
      );
    });
  });
});
