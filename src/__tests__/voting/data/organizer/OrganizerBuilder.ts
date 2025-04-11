import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { Organizer } from '../../../../voting/dto/organizer.dto';

export default class OrganizerBuilder
  implements IDataBuilder<Organizer>
{
  private readonly base: Organizer = {
    player_id: '',
    clan_id: ''
  };

  build(): Organizer {
    return { ...this.base };
  }
  setClanId(clan_id: string) {
    this.base.clan_id = clan_id;
    return this;
  }
}
