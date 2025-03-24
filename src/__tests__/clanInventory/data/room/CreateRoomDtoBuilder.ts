import { CreateRoomDto } from '../../../../clanInventory/room/dto/createRoom.dto';

export default class CreateRoomDtoBuilder {
  private readonly base: Partial<CreateRoomDto> = {
    floorType: 'defaultFloor',
    wallType: 'defaultWall',
    hasLift: false,
    cellCount: 10,
    soulHome_id: undefined,
  };

  build(): CreateRoomDto {
    return { ...this.base } as CreateRoomDto;
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

  setSoulHomeId(soulHomeId: string) {
    this.base.soulHome_id = soulHomeId;
    return this;
  }
}
