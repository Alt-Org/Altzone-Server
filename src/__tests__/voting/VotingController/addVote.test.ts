import { VotingController } from '../../../voting/voting.controller';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';
import { VoteChoice } from '../../../voting/enum/choiceType.enum';

describe('VotingController.addVote()', () => {
  const body = {
    voting_id: 'voting-1',
    choice: VoteChoice.YES,
  };
  const user = { player_id: 'player-1' } as any;

  let votingService: any;
  let emitterService: any;
  let controller: VotingController;

  beforeEach(() => {
    votingService = {
      validateClanVotingPermission: jest.fn().mockResolvedValue(true),
      addVote: jest.fn().mockResolvedValue(undefined),
    };
    emitterService = {
      EmitNewDailyTaskEvent: jest.fn().mockResolvedValue(undefined),
    };
    controller = new VotingController(votingService, emitterService);
  });

  it('progresses YOUR_VOICE only after a clan vote has been saved', async () => {
    await controller.addVote(body, user);

    expect(votingService.addVote).toHaveBeenCalledWith(
      body.voting_id,
      body.choice,
      user.player_id,
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      user.player_id,
      ServerTaskName.YOUR_VOICE,
    );
    expect(votingService.addVote.mock.invocationCallOrder[0]).toBeLessThan(
      emitterService.EmitNewDailyTaskEvent.mock.invocationCallOrder[0],
    );
  });

  it('does not save or progress a task when the voting is outside the player clan', async () => {
    votingService.validateClanVotingPermission.mockResolvedValue(false);

    await controller.addVote(body, user);

    expect(votingService.addVote).not.toHaveBeenCalled();
    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });

  it.each(['expired', 'already voted', 'save failed'])(
    'does not progress a task when adding a vote fails: %s',
    async () => {
      votingService.addVote.mockRejectedValueOnce(new Error('vote failed'));

      await expect(controller.addVote(body, user)).rejects.toThrow(
        'vote failed',
      );

      expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
    },
  );
});
