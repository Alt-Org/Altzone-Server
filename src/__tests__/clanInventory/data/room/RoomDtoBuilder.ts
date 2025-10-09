import { ObjectId } from 'mongodb';
import { RoomDto } from '../../../../clanInventory/room/dto/room.dto';

export default class RoomDtoBuilder {
  private readonly base: Partial<RoomDto> = {
    _id: new ObjectId().toString(),
    floorType: undefined,
    wallType: undefined,
    hasLift: undefined,
    cellCount: undefined,
  };

  build(): RoomDto {
    return { ...this.base } as RoomDto;
  }

  setId(id: string) {
    this.base._id = id;
    return this;
  }

  setFloorType(floorType: string) {
    this.base.floorType = floorType;
    return this;
  }

  setWallType(wallType: string) {
    this.base.wallType = wallType;
    return this;
  }

  setHasLift(hasLift: boolean) {
    this.base.hasLift = hasLift;
    return this;
  }

  setCellCount(cellCount: number) {
    this.base.cellCount = cellCount;
    return this;
  }
}
