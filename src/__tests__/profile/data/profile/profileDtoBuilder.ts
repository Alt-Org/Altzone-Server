import { ProfileDto } from '../../../../profile/dto/profile.dto';
import { PlayerDto } from '../../../../player/dto/player.dto';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';

export default class ProfileDtoBuilder implements IDataBuilder<ProfileDto> {
  private readonly base: ProfileDto = {
    _id: undefined,
    username: 'defaultUser',
    Player: undefined,
  };

  build(): ProfileDto {
    return { ...this.base };
  }

  setId(id: string) {
    this.base._id = id;
    return this;
  }

  setUsername(username: string) {
    this.base.username = username;
    return this;
  }

  setPlayer(player: PlayerDto) {
    this.base.Player = player;
    return this;
  }
}
