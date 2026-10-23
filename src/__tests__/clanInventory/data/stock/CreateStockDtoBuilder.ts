import { CreateStockDto } from '../../../../clanInventory/stock/dto/createStock.dto';
import { ObjectId } from 'mongodb';
import { Environment } from '../../../../common/enum/environment.enum';

export default class CreateStockDtoBuilder {
  private readonly base: Partial<CreateStockDto> = {
    cellCount: 10,
    clan_id: undefined,
    environment: Environment.TEACHING_DEMO,
  };

  build() {
    return { ...this.base } as CreateStockDto;
  }

  setCellCount(cellCount: number) {
    this.base.cellCount = cellCount;
    return this;
  }

  setClanId(clanId: string | ObjectId) {
    this.base.clan_id = clanId as any;
    return this;
  }

  setEnvironment(environment: Environment) {
    this.base.environment = environment;
    return this;
  }
}
