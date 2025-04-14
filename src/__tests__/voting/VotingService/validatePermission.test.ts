import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { PlayerService } from '../../../player/player.service';
import ServiceError from '../../../common/service/basicService/ServiceError';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';

describe('VotingService.validatePermission() test suite', () => {
  let votingService: VotingService;
  let playerService: PlayerService;

  const votingBuilder = VotingBuilderFactory.getBuilder('CreateVotingDto');

  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
    playerService = await PlayerModule.getPlayerService();
  });

  it('Should validate that player can use the voting if input is valid', async () => {
    const minPercentage = 1;
    const votingToCreate = votingBuilder
      .setMinPercentage(minPercentage)
      .build();

    const [voting, errors] = await votingService.createOne(votingToCreate);
    expect(voting).not.toBeNull();
    expect(errors).toBeNull();

    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();

    await playerService.createOne(playerToCreate);
    const updatePlayerBuilder =
      PlayerBuilderFactory.getBuilder('UpdatePlayerDto');

    const dbData = (await playerModel.findOne({ name: playerName })).toObject();

    const updatePlayer = updatePlayerBuilder
      .setClanId(voting.organizer.clan_id)
      .build();

    const [wasUpdated, errorsPlayerUpdate] =
      await playerService.updatePlayerById(dbData._id, updatePlayer);
    expect(errorsPlayerUpdate).toBeNull();
    expect(wasUpdated).toBeTruthy();

    const player = (await playerModel.findOne({ name: playerName })).toObject();
    expect(player.clan_id.toString()).toBe(voting.organizer.clan_id.toString());

    const isValid = await votingService.validatePermission(
      voting._id.toString(),
      dbData._id.toString(),
    );
    expect(isValid).toBe(true);
  });

  it('Should validate that player can use the voting if input is valid and voting does NOT have clan_id', async () => {
    const minPercentage = 1;
    const votingToCreate = votingBuilder
      .setMinPercentage(minPercentage)
      .setOrganizer({ player_id: '123', clan_id: null }) // No clan_id
      .build();

    const [voting, errors] = await votingService.createOne(votingToCreate);
    expect(voting).not.toBeNull();
    expect(errors).toBeNull();

    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();

    await playerService.createOne(playerToCreate);

    const dbData = (await playerModel.findOne({ name: playerName })).toObject();

    const isValid = await votingService.validatePermission(
      voting._id.toString(),
      dbData._id.toString(),
    );
    expect(isValid).toBe(true);
  });

  it('Should NOT validate if the player and voting clan_ids are different', async () => {
    const minPercentage = 1;
    const clanId = '67e98560ef641b26bb7cbf6b';
    const votingToCreate = votingBuilder
      .setMinPercentage(minPercentage)
      .setOrganizer({ player_id: '123', clan_id: clanId })
      .build();

    const [voting, errors] = await votingService.createOne(votingToCreate);
    expect(voting).not.toBeNull();
    expect(errors).toBeNull();
    expect(voting.organizer.clan_id).toBe(clanId);

    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();

    await playerService.createOne(playerToCreate);
    const updatePlayerBuilder =
      PlayerBuilderFactory.getBuilder('UpdatePlayerDto');

    const dbData = (await playerModel.findOne({ name: playerName })).toObject();

    const differentClanId = '67e98560ef641b26bb7cbf5b'; // Different clan_id
    const updatePlayer = updatePlayerBuilder.setClanId(differentClanId).build(); // Different clan_id

    const [wasUpdated, errorsPlayerUpdate] =
      await playerService.updatePlayerById(dbData._id, updatePlayer);
    expect(errorsPlayerUpdate).toBeNull();
    expect(wasUpdated).toBeTruthy();

    const player = (await playerModel.findOne({ name: playerName })).toObject();
    expect(player.clan_id.toString()).toBe(differentClanId);

    const isValid = await votingService.validatePermission(
      voting._id.toString(),
      dbData._id.toString(),
    );
    expect(isValid).toBeFalsy();
  });

  it('Should return with errors if the voting does NOT exist', async () => {
    const minPercentage = 1;
    const votingToCreate = votingBuilder
      .setMinPercentage(minPercentage)
      .build();

    const [voting, errors] = await votingService.createOne(votingToCreate);
    expect(voting).not.toBeNull();
    expect(errors).toBeNull();

    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();

    await playerService.createOne(playerToCreate);
    const updatePlayerBuilder =
      PlayerBuilderFactory.getBuilder('UpdatePlayerDto');

    const dbData = (await playerModel.findOne({ name: playerName })).toObject();

    const updatePlayer = updatePlayerBuilder
      .setClanId('67e98560ef641b26bb7cbf5b')
      .build(); // Different clan_id

    const [wasUpdated, errorsPlayerUpdate] =
      await playerService.updatePlayerById(dbData._id, updatePlayer);
    expect(errorsPlayerUpdate).toBeNull();
    expect(wasUpdated).toBeTruthy();

    try {
      await votingService.validatePermission(
        'invalidVotingId',
        dbData._id.toString(),
      );
    } catch (error) {
      expect(error[0]).toBeInstanceOf(ServiceError);
    }
  });
});
