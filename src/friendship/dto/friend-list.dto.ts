import { Expose } from 'class-transformer';
import { AvatarDto } from '../../player/dto/avatar.dto';

export class FriendlistDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  avatar: AvatarDto;

  @Expose()
  clan: string;
}
