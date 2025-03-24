import { Expose } from 'class-transformer';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { ExtractField } from '../../../common/decorator/response/ExtractField';

@AddType('JoinDto')
export class JoinDto {
  @ExtractField()
  @Expose()
  _id: string;

  @Expose()
  clan_id: string; // the clan id we are trying to join

  @Expose()
  player_id: string; // the player who is trying to join

  @Expose()
  join_message: string; // join message if clan is private

  @Expose()
  accepted: boolean; // whether you are accepted or you arent
}
