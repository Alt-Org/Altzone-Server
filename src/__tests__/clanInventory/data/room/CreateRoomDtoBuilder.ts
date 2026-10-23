import { RoomStatus } from '../../../../clanInventory/room/enum/roomStatus.enum';
import { CreateRoomDto } from '../../../../clanInventory/room/dto/createRoom.dto';

export default class CreateRoomDtoBuilder {
  private readonly base: Partial<CreateRoomDto> = {
    roomPosition: 1,
    roomColour: 'defaultColor',
    floorType: 'defaultFloor',
    wallpaper: 'defaultWall',
    roomStatus: RoomStatus.ACTIVE,
    soulHome_id: undefined,
  };

  build(): CreateRoomDto {
    return { ...this.base } as CreateRoomDto;
  }

  setRoomPosition(position: number) {
    this.base.roomPosition = position;
    return this;
  }

  setRoomColour(colour: string) {
    this.base.roomColour = colour;
    return this;
  }

  setFloorType(floorType: string) {
    this.base.floorType = floorType;
    return this;
  }

  setWallpaper(wallpaper: string) {
    this.base.wallpaper = wallpaper;
    return this;
  }

  setRoomStatus(status: RoomStatus) {
    this.base.roomStatus = status;
    return this;
  }

  setSoulHomeId(soulHomeId: string) {
    this.base.soulHome_id = soulHomeId;
    return this;
  }
}
