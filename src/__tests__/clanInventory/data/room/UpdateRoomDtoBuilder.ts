import { UpdateRoomDto } from '../../../../clanInventory/room/dto/updateRoom.dto';

export default class UpdateRoomDtoBuilder {
  private readonly base: Partial<UpdateRoomDto> = {
    _id: undefined,
    floor: undefined,
    wallpaper: undefined,
  };

  build(): UpdateRoomDto {
    return { ...this.base } as UpdateRoomDto;
  }

  setId(id: string) {
    this.base._id = id;
    return this;
  }

  setFloor(floor: string) {
    this.base.floor = floor;
    return this;
  }

  setWallpaper(wallpaper: string) {
    this.base.wallpaper = wallpaper;
    return this;
  }
}
