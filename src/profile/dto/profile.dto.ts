import { Expose, Type } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { PlayerDto } from '../../player/dto/player.dto';
import AddType from '../../common/base/decorator/AddType.decorator';
import { Environment } from '../../common/enum/environment.enum';

@AddType('ProfileDto')
export class ProfileDto {
  @ExtractField()
  @Expose()
  _id: string;

  @Expose()
  username: string;

  @Type(() => PlayerDto)
  @Expose()
  Player: PlayerDto;

  @Expose()
  environment?: Environment;

  @Expose()
  expiresAt?: Date;
}
