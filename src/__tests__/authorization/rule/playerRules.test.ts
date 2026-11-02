import { User } from '../../../auth/user';
import { Action } from '../../../authorization/enum/action.enum';
import { playerRules } from '../../../authorization/rule/playerRules';
import { PlayerDto } from '../../../player/dto/player.dto';
import { UpdatePlayerDto } from '../../../player/dto/updatePlayer.dto';

describe('playerRules() update authorization', () => {
  const playerId = '507f1f77bcf86cd799439011';
  const clanId = '507f1f77bcf86cd799439012';
  const user = new User('profile-id', playerId);

  it('does not perform clan lookups or allow clan changes through PUT /player', async () => {
    const getModelInstanceById = jest.fn();
    const ability = await playerRules(
      user,
      UpdatePlayerDto,
      Action.update,
      { _id: playerId, clan_id: clanId } as any,
      { getModelInstanceById } as any,
    );
    const update = Object.assign(new PlayerDto(), {
      _id: playerId,
      clan_id: clanId,
    });

    expect(getModelInstanceById).not.toHaveBeenCalled();
    expect(ability.can(Action.update_request, update, 'clan_id')).toBe(false);
  });
});
