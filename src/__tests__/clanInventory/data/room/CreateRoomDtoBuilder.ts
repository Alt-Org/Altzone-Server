import { CreateRoomDto } from '../../../../clanInventory/room/dto/createRoom.dto';

export default class CreateRoomDtoBuilder {
  private readonly base: Partial<CreateRoomDto> = {
    roomPosition: 1,
    roomColour: "defaultColor",
    floor: 'defaultFloor',
    wallpaper: 'defaultWall',
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
