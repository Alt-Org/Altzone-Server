import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { PlayerService } from '../../../player/player.service';

describe('VotingService.validatePermission() test suite', () => {
  let votingService: VotingService;
  let playerService: PlayerService;
  
  const votingBuilder = VotingBuilderFactory.getBuilder('CreateVotingDto');

  const playerBuilder = VotingBuilderFactory.getBuilder('CreatePlayerDto');

  const votingModel = VotingModule.getVotingModel();
  const playerModel = VotingModule.getPlayerModel();

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
    playerService = await VotingModule.getPlayerService();
  });

  it('Should validates that player can use the voting if input is valid', async () => {
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
      const updatePlayerBuilder = VotingBuilderFactory.getBuilder('UpdatePlayerDto');
  
      const dbData = (await playerModel.findOne({ name: playerName })).toObject();

      let updatePlayer = updatePlayerBuilder.setClanId(voting.organizer.clan_id).build();
      
      const [wasUpdated, errorsPlayerUpdate] = await playerService.updatePlayerById(dbData._id,updatePlayer);
      expect(errorsPlayerUpdate).toBeNull();
      expect(wasUpdated).toBeTruthy();

      const player = await playerModel.findOne({ name: playerName });

      const isValid = await votingService
        .validatePermission(voting._id.toString(), dbData._id.toString());
      expect(isValid).toBe(true);
    
  });
});
