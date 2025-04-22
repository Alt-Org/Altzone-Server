import { UpdateRoomDto } from '../../../../clanInventory/room/dto/updateRoom.dto';

export default class UpdateRoomDtoBuilder {
  private readonly base: Partial<UpdateRoomDto> = {
    _id: undefined,
    floorType: undefined,
    wallType: undefined,
    hasLift: undefined,
    cellCount: undefined,
  };

  build(): UpdateRoomDto {
    return { ...this.base } as UpdateRoomDto;
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
