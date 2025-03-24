import { UpdateStockDto } from '../../../../clanInventory/stock/dto/updateStock.dto';

export default class UpdateStockDtoBuilder {
  private readonly base: Partial<UpdateStockDto> = {
    _id: undefined,
    cellCount: undefined,
    clan_id: undefined,
  };

  build() {
    return { ...this.base } as UpdateStockDto;
  }

  setId(id: string) {
    this.base._id = id;
    return this;
  }

  setCellCount(cellCount: number) {
    this.base.cellCount = cellCount;
    return this;
  }

  setClanId(clanId: string) {
    this.base.clan_id = clanId;
    return this;
  }
}
