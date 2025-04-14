import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { ObjectId } from 'mongodb';

describe('VotingService.validatePermission() test suite', () => {
  let votingService: VotingService;

  const votingBuilder = VotingBuilderFactory.getBuilder('CreateVotingDto');
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
  });

  const createTestPlayer = async (clan_id?: string) => {
    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();
    await playerModel.create(playerToCreate);

    const dbPlayer = (
      await playerModel.findOne({ name: playerName })
    ).toObject();

    if (clan_id) {
      await playerModel.findByIdAndUpdate(dbPlayer._id, { clan_id });
      const updatedPlayer = await playerModel.findOne({ name: playerName });
      return updatedPlayer.toObject();
    }

    return dbPlayer;
  };

  const createTestVoting = async (organizer: {
    player_id: string;
    clan_id: string | null;
  }) => {
    const votingToCreate = votingBuilder
      .setMinPercentage(1)
      .setOrganizer(organizer)
      .build();

    const [voting, errors] = await votingService.createOne(votingToCreate);
    expect(voting).not.toBeNull();
    expect(errors).toBeNull();
    return voting!;
  };

  it('Should validate when player and voting have the same clan_id', async () => {
    const clan_id = new ObjectId().toString();
    const player = await createTestPlayer(clan_id);
    const voting = await createTestVoting({
      player_id: player._id.toString(),
      clan_id,
    });

    const isValid = await votingService.validatePermission(
      voting._id.toString(),
      player._id.toString(),
    );

    expect(isValid).toBe(true);
  });

  it('Should validate when voting has no clan_id', async () => {
    const player = await createTestPlayer();
    const voting = await createTestVoting({
      player_id: player._id.toString(),
      clan_id: null,
    });

    const isValid = await votingService.validatePermission(
      voting._id.toString(),
      player._id.toString(),
    );

    expect(isValid).toBe(true);
  });

  it('Should return false if player and voting have different clan_ids', async () => {
    const playerClanId = new ObjectId().toString();
    const votingClanId = new ObjectId().toString();

    const player = await createTestPlayer(playerClanId);
    const voting = await createTestVoting({
      player_id: player._id.toString(),
      clan_id: votingClanId,
    });

    const isValid = await votingService.validatePermission(
      voting._id.toString(),
      player._id.toString(),
    );

    expect(isValid).toBe(false);
  });

  it('Should throw an error if voting does not exist', async () => {
    const player = await createTestPlayer(new ObjectId().toString());

    await expect(
      votingService.validatePermission(
        new ObjectId().toString(),
        player._id.toString(),
      ),
    ).rejects.toContainSE_NOT_FOUND();
  });
});
