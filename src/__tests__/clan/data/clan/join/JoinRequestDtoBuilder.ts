import IDataBuilder from '../../../../test_utils/interface/IDataBuilder';
import { JoinRequestDto } from '../../../../../clan/join/dto/joinRequest.dto';

export default class JoinRequestDtoBuilder
  implements IDataBuilder<JoinRequestDto>
{
  private readonly base: JoinRequestDto = {
    clanId: undefined,
    password: 'default join message',
  };

  build() {
    return { ...this.base };
  }

  setClanId(clan_id: string) {
    this.base.clanId = clan_id;
    return this;
  }

  setPassword(password: string) {
    this.base.password = password;
    return this;
  }
}
