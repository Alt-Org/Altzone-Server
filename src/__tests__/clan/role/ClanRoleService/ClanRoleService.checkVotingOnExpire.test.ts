import ClanRoleService from '../../../../clan/role/clanRole.service';
import { VoteChoice } from '../../../../voting/enum/choiceType.enum';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import PlayerModule from '../../../player/modules/player.module';
import VotingBuilderFactory from '../../../voting/data/voting/VotingBuilderFactory';
import VotingModule from '../../../voting/modules/voting.module';
import ClanModule from '../../modules/clan.module';
import { ObjectId } from 'mongodb';

describe('ClanRoleService.checkVotingOnExpire', () => {
  let roleService: ClanRoleService;
  const votingModel = VotingModule.getVotingModel();
  const playerModel = PlayerModule.getPlayerModel();

  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');
  const voteBuilder = VotingBuilderFactory.getBuilder('Vote');
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');

  beforeEach(async () => {
    roleService = await ClanModule.getClanRoleService();
    await votingModel.deleteMany({});
    await playerModel.deleteMany({});
  });

  it('should update player role if vote passed', async () => {
    // Create a player and a role
    const player = await playerModel.create(playerBuilder.build());
    const role_id = new ObjectId();
    // Create a votingDto with the player and role
    const vote = voteBuilder.setChoice(VoteChoice.YES).build();
    const votingDto = votingBuilder
      .setMinPercentage(1)
      .setVotes([vote])
      .setSetClanRole({
        player_id: player._id,
        role_id: role_id.toString(),
      })
      .build();

    await votingModel.create(votingDto);

    // Run checkVotingOnExpire
    const [result, errors] = await roleService.checkVotingOnExpire(votingDto);

    // Player should have updated clanRole_id
    const updatedPlayer = await playerModel.findById(player._id);
    expect(updatedPlayer.clanRole_id.toString()).toBe(role_id.toString());

    expect(result).toBe(true);
    expect(errors).toBeNull();
  });

  it('should not update player if vote did not pass', async () => {
    // Create a player and a role
    const clanRoleId = new ObjectId();
    const player = await playerModel.create(
      playerBuilder.setClanRoleId(clanRoleId).build(),
    );
    const role_id = new ObjectId();
    // Create a votingDto with the player and role, but no YES votes
    const vote = voteBuilder.setChoice(VoteChoice.NO).build();
    const votingDto = votingBuilder
      .setMinPercentage(1)
      .setVotes([vote])
      .setSetClanRole({
        player_id: player._id,
        role_id: role_id.toString(),
      })
      .build();

    await votingModel.create(votingDto);

    // Run checkVotingOnExpire
    const [result, errors] = await roleService.checkVotingOnExpire(votingDto);

    // Player should NOT have updated clanRole_id
    const updatedPlayer = await playerModel.findById(player._id);
    expect(updatedPlayer.clanRole_id).toEqual(clanRoleId);

    expect(result).toBe(true);
    expect(errors).toBeNull();
  });
});
