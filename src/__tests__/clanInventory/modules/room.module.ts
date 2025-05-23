import mongoose from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { RoomService } from '../../../clanInventory/room/room.service';
import RoomHelperService from '../../../clanInventory/room/utils/room.helper.service';
import { RoomSchema } from '../../../clanInventory/room/room.schema';
import ClanInventoryCommonModule from './clanInventoryCommon';

export default class RoomModule {
  private constructor() {}

  static async getRoomService() {
    const module = await ClanInventoryCommonModule.getModule();
    return await module.resolve(RoomService);
  }

  static async getRoomHelperService() {
    const module = await ClanInventoryCommonModule.getModule();
    return await module.resolve(RoomHelperService);
  }

  static getRoomModel() {
    return mongoose.model(ModelName.ROOM, RoomSchema);
  }
}
