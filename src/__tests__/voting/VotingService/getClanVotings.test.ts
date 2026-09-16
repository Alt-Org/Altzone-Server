import VotingBuilderFactory from '../data/voting/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { ObjectId } from 'mongodb';

describe('VotingService.getClanVotings() test suite', () => {
  let votingService: VotingService;

  const votingBuilder = VotingBuilderFactory.getBuilder('CreateVotingDto');
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const playerModel = PlayerModule.getPlayerModel();
  const votingModel = VotingModule.getVotingModel();

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
  });

  const createVotingForOrganizer = async (playerId: string, clanId: string) => {
    const votingToCreate = votingBuilder
      .setMinPercentage(1)
      .setOrganizer({ player_id: playerId, clan_id: clanId })
      .build();
    return await votingModel.create(votingToCreate);
  };

  it('Should return all votings where organizer is the player or their clan', async () => {
    const clanId = new ObjectId().toString();
    const playerToCreate = playerBuilder
      .setName(`voting-${Date.now().toString(36).slice(-6)}`)
      .build();
    (playerToCreate as any).clan_id = clanId;

    const player = await playerModel.create(playerToCreate);
    const createdVotings = await Promise.all([
      createVotingForOrganizer(player._id.toString(), clanId),
      createVotingForOrganizer(player._id.toString(), clanId),
    ]);

    const [votings] = await votingService.getClanVotings(player._id.toString());
    const returnedVotingIds = votings.map((voting) => voting._id.toString());
    const createdVotingIds = createdVotings.map((voting) =>
      voting._id.toString(),
    );

    expect(returnedVotingIds).toEqual(expect.arrayContaining(createdVotingIds));
    expect(
      votings.every(
        (v) =>
          v.organizer.player_id.toString() === player._id.toString() ||
          v.organizer.clan_id?.toString() === clanId,
      ),
    ).toBe(true);
  });

  it('Should return a validation error if player _id is invalid', async () => {
    const invalidId = 'invalidId';

    await expect(votingService.getClanVotings(invalidId)).rejects.toMatchObject(
      [
        {
          field: '_id',
          message: expect.stringContaining('Cast to ObjectId failed'),
        },
      ],
    );
  });
});
