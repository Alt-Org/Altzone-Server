import { CreateRoomDto } from '../../../../clanInventory/room/dto/createRoom.dto';

export default class CreateRoomDtoBuilder {
  private readonly base: Partial<CreateRoomDto> = {
    floor: 'defaultFloor',
    wallpaper: 'defaultWall',
    soulHome_id: undefined,
  };

  build(): CreateRoomDto {
    return { ...this.base } as CreateRoomDto;
  }

  setFloor(floor: string) {
    this.base.floor = floor;
    return this;
  }

  setWallpaper(wallpaper: string) {
    this.base.wallpaper = wallpaper;
    return this;
  }

  setSoulHomeId(soulHomeId: string) {
    this.base.soulHome_id = soulHomeId;
    return this;
  }
}
