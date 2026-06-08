import { CreateProfileDto } from '../../../../profile/dto/createProfile.dto';
import { CreatePlayerDto } from '../../../../player/dto/createPlayer.dto';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { Environment } from '../../../../common/enum/environment.enum';

export default class CreateProfileDtoBuilder
  implements IDataBuilder<CreateProfileDto>
{
  private readonly base: CreateProfileDto = {
    username: 'defaultUser',
    password: 'defaultPassword',
    environment: Environment.TEACHING_DEMO,
    Player: undefined,
  };

  build(): CreateProfileDto {
    return { ...this.base };
  }

  setUsername(username: string) {
    this.base.username = username;
    return this;
  }

  setPassword(password: string) {
    this.base.password = password;
    return this;
  }

  setPlayer(player: CreatePlayerDto) {
    this.base.Player = player;
    return this;
  }

  setEnvironment(environment: Environment) {
    this.base.environment = environment;
    return this;
  }
}
