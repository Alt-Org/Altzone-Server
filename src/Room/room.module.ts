import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { RoomController } from "./room.controller";
import { RoomService } from "./room.service";
import { RequestHelperModule } from "../requestHelper/requestHelper.module";
import { RoomSchema } from "./room.schema";
import { PlayerModule } from "../player/player.module";
import { ClanSchema } from "../clan/clan.schema";
import RoomHelperService from "./utils/room.helper.service";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.ROOM, schema: RoomSchema } ]),
        MongooseModule.forFeature([ {name: ModelName.CLAN, schema: ClanSchema } ]),
        PlayerModule,
        RequestHelperModule,
    ],
    controllers: [ RoomController ],
    providers: [ RoomService, RoomHelperService ],
    exports: [ RoomService ]
})
export class RoomModule {}