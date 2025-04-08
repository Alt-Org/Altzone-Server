import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { FleaMarketItemDto } from '../../../..//fleaMarket/dto/fleaMarketItem.dto';
import { ItemName } from '../../../..//clanInventory/item/enum/itemName.enum';
import { Recycling } from '../../../..//clanInventory/item/enum/recycling.enum';
import { QualityLevel } from '../../../..//clanInventory/item/enum/qualityLevel.enum';
import { Status } from '../../../../fleaMarket/enum/status.enum';

export default class FleaMarketItemDtoBuilder implements IDataBuilder<FleaMarketItemDto> {
  build(): FleaMarketItemDto {
    return { ...this.base };
  }
  private readonly base: FleaMarketItemDto = {
    _id: '67e98660df641b26bb7cbf6b',
    name: ItemName.SOFA_TAAKKA,
    weight: 0,
    recycling: Recycling.MIXED_WASTE,
    qualityLevel: QualityLevel.common,
    unityKey: '',
    status: Status.AVAILABLE,
    isFurniture: false,
    price: 0,
    clan_id: ''
  }
}
