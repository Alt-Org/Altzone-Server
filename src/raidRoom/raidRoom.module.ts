import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {RaidRoomSchema} from "./raidRoom.schema";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {ModelName} from "../common/enum/modelName.enum";
import {RaidRoomController} from "./raidRoom.controller";
import {RaidRoomService} from "./raidRoom.service";
import {isRaidRoomExists} from "./decorator/validation/IsRaidRoomExists.decorator";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.RAID_ROOM, schema: RaidRoomSchema} ]),
        RequestHelperModule
    ],
    controllers: [RaidRoomController],
    providers: [ RaidRoomService, isRaidRoomExists ],
    exports: [RaidRoomService]
})
export class RaidRoomModule {}