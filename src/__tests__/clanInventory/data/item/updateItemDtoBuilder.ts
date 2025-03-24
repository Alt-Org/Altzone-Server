import { UpdateItemDto } from '../../../../clanInventory/item/dto/updateItem.dto';

export default class UpdateItemDtoBuilder {
  private readonly base: Partial<UpdateItemDto> = {
    _id: undefined,
    location: undefined,
  };

  build(): UpdateItemDto {
    return { ...this.base } as UpdateItemDto;
  }

  setId(id: string) {
    this.base._id = id;
    return this;
  }

  setLocation(location: Array<number>) {
    this.base.location = location;
    return this;
  }
}
