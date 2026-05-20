import { ObjectId } from 'mongodb';
import { ClanRoleVotingProcessor } from '../../../../clan/role/clanRole.processor';
import ClanRoleService from '../../../../clan/role/clanRole.service';
import { VotingType } from '../../../../voting/enum/VotingType.enum';
import { VoteChoice } from '../../../../voting/enum/choiceType.enum';
import ClanModule from '../../modules/clan.module';
import VotingModule from '../../../voting/modules/voting.module';

describe('ClanRoleVotingProcessor.process() test suite', () => {
  let processor: ClanRoleVotingProcessor;
  let roleService: ClanRoleService;

  const votingModel = VotingModule.getVotingModel();

  beforeEach(async () => {
    processor = await ClanModule.getClanRoleVotingProcessor();
    roleService = await ClanModule.getClanRoleService();
    await votingModel.deleteMany({});
  });

  it('Should process the latest voting from DB instead of the stale job payload', async () => {
    const votingId = new ObjectId();
    const staleVote = { player_id: new ObjectId(), choice: VoteChoice.NO };
    const freshVote = { player_id: new ObjectId(), choice: VoteChoice.YES };

    await votingModel.create({
      _id: votingId,
      organizer: {
        player_id: new ObjectId(),
        clan_id: new ObjectId(),
      },
      endsOn: new Date(Date.now() + 3600000),
      type: VotingType.SET_CLAN_ROLE,
      minPercentage: 51,
      votes: [freshVote],
      setClanRole: {
        player_id: new ObjectId(),
        role_id: new ObjectId(),
      },
    });

    const mockedJob: any = {
      data: {
        voting: {
          _id: votingId.toString(),
          votes: [staleVote],
        },
      },
    };

    const spy = jest
      .spyOn(roleService, 'checkVotingOnExpire')
      .mockResolvedValue([true, null] as any);

    await processor.process(mockedJob);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]._id.toString()).toBe(votingId.toString());
    expect(spy.mock.calls[0][0].votes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ choice: VoteChoice.YES }),
      ]),
    );
    expect(spy.mock.calls[0][0].votes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ choice: VoteChoice.NO }),
      ]),
    );
  });
});
