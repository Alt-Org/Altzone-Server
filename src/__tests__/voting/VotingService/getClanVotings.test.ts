import VotingBuilderFactory from '../data/voting/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';

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
    const playerToCreate = playerBuilder.setName('john').build();
    const player = await playerModel.create(playerToCreate);
    const clanId = '67e98660df641b26bb7cbf6b';

    await createVotingForOrganizer(player._id.toString(), clanId);
    await createVotingForOrganizer(player._id.toString(), clanId);

    const [votings] = await votingService.getClanVotings(player._id.toString());

    expect(votings).toHaveLength(2);
    expect(
      votings.every(
        (v) => v.organizer.player_id.toString() === player._id.toString(),
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
