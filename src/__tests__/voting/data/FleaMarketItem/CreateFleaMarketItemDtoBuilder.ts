import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { FleaMarketItemDto } from '../../../../fleaMarket/dto/fleaMarketItem.dto';
import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';
import { Recycling } from '../../../../clanInventory/item/enum/recycling.enum';
import { QualityLevel } from '../../../../clanInventory/item/enum/qualityLevel.enum';
import { Status } from '../../../../fleaMarket/enum/status.enum';
import { CreateFleaMarketItemDto } from '../../../../fleaMarket/dto/createFleaMarketItem.dto';

export default class CreateFleaMarketItemDtoBuilder
  implements IDataBuilder<CreateFleaMarketItemDto>
{
  build(): CreateFleaMarketItemDto {
    return { ...this.base };
  }

  private readonly base: CreateFleaMarketItemDto = {
    name: ItemName.SOFA_TAAKKA,
    weight: 0,
    recycling: Recycling.MIXED_WASTE,
    qualityLevel: QualityLevel.common,
    status: Status.AVAILABLE,
    price: 0,
    unityKey: '67e98660df641b26bb7cbf6b',
    isFurniture: false,
    clan_id: '67e98660df641b26bb7cbf6b',
  };

  setId(id: string): CreateFleaMarketItemDtoBuilder {
    return this;
  }
}
