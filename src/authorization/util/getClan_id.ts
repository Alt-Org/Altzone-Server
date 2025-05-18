import { User } from '../../auth/user';
import { PlayerDto } from '../../player/dto/player.dto';
import { ModelName } from '../../common/enum/modelName.enum';
import { RequestHelperService } from '../../requestHelper/requestHelper.service';
import { Connection } from 'mongoose';
import { Player } from '../../player/schemas/player.schema';

/**
 * The function determines the clan_id of the provided user object.
 * @param user
 * @param requestHelperService
 */
export const getClan_id = async (
  user: User,
  requestHelperService: RequestHelperService,
  connection?: Connection,
): Promise<string | null> => {
  let player: Player;
  if (connection) {
    player = await connection.model(ModelName.PLAYER).findById(user.player_id);
  } else {
    player = await requestHelperService.getModelInstanceById(
      ModelName.PLAYER,
      user.player_id,
      Player,
    );
  }
  return player ? player.clan_id : null;
};
