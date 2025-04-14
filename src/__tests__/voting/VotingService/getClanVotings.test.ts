import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';
import { PlayerService } from '../../../player/player.service';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';

describe('VotingService.getClanVotings() test suite', () => {
  let votingService: VotingService;
  let playerService: PlayerService;

  const votingBuilder = VotingBuilderFactory.getBuilder('CreateVotingDto');
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');

  const votingModel = VotingModule.getVotingModel();
  const playerModel = VotingModule.getPlayerModel();

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
    playerService = await VotingModule.getPlayerService();
  });

  it('Get all votings where the organizer is the player or players clan', async () => {
    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();

    await playerService.createOne(playerToCreate);
    const player = (await playerModel.findOne({ name: playerName })).toObject();
    expect(player).not.toBeNull();

    const minPercentage1 = 1;
    const votingToCreate1 = votingBuilder
      .setMinPercentage(minPercentage1)
      .setOrganizer({
        player_id: player._id.toString(),
        clan_id: '67e98660df641b26bb7cbf6b',
      })
      .build();

    const [voting1, errors1] = await votingService.createOne(votingToCreate1);
    expect(voting1).not.toBeNull();
    expect(errors1).toBeNull();

    const minPercentage2 = 2;
    const votingToCreate2 = votingBuilder
      .setMinPercentage(minPercentage2)
      .setOrganizer({
        player_id: player._id.toString(),
        clan_id: '67e98660df641b26bb7cbf6b',
      })
      .build();

    const [voting2, errors2] = await votingService.createOne(votingToCreate2);
    expect(voting2).not.toBeNull();
    expect(errors2).toBeNull();

    const votings = await votingService.getClanVotings(player._id.toString());
    expect(votings.length).toBe(2);
  });

  it('Return with errors if Player Id is invalid', async () => {
    const invalidId = 'invalidId';

    try {
      await votingService.getClanVotings(invalidId);
    } catch (error) {
      expect(error[0].field).toBe('_id');
      expect(error[0].message).toContain('Cast to ObjectId failed for value');
    }
  });
});
