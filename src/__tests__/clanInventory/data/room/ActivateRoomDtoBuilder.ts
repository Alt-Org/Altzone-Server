import { ActivateRoomDto } from '../../../../clanInventory/room/dto/ActivateRoom.dto';

export default class ActivateRoomDtoBuilder {
  private readonly base: Partial<ActivateRoomDto> = {
    room_ids: [],
    durationS: 300,
  };

  build(): ActivateRoomDto {
    return { ...this.base } as ActivateRoomDto;
  }

  setRoomIds(roomIds: string[]) {
    this.base.room_ids = roomIds;
    return this;
  }

  setDuration(durationS: number) {
    this.base.durationS = durationS;
    return this;
  }
}
