import { Stock } from '../../../../clanInventory/stock/stock.schema';
import { ObjectId } from 'mongodb';
import { Environment } from '../../../../common/enum/environment.enum';

export default class StockBuilder {
  private readonly base: Partial<Stock> = {
    cellCount: 10,
    clan_id: undefined,
    _id: undefined,
    environment: undefined,
  };

  build() {
    return { ...this.base } as Stock;
  }

  setCellCount(cellCount: number) {
    this.base.cellCount = cellCount;
    return this;
  }

  setClanId(clanId: string | ObjectId) {
    this.base.clan_id = clanId as any;
    return this;
  }

  setId(_id: string | ObjectId) {
    this.base._id = _id as any;
    return this;
  }

  setEnvironment(environment: Environment) {
    this.base.environment = environment;
    return this;
  }
}
