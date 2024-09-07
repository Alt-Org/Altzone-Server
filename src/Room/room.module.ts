import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { RoomController } from "./room.controller";
import { RoomService } from "./room.service";
import { RequestHelperModule } from "../requestHelper/requestHelper.module";
import { RoomSchema } from "./room.schema";
import { PlayerModule } from "../player/player.module";
import { ClanSchema } from "../clan/clan.schema";
import RoomHelperService from "./utils/room.helper.service";
import { SoulhomeSchema } from "../soulhome/soulhome.schema";
import { ItemModule } from "../item/item.module";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.SOULHOME, schema: SoulhomeSchema } ]),
        MongooseModule.forFeature([ {name: ModelName.ROOM, schema: RoomSchema } ]),
        MongooseModule.forFeature([ {name: ModelName.CLAN, schema: ClanSchema } ]),
        PlayerModule,
        RequestHelperModule,
        forwardRef(() => ItemModule),
    ],
    controllers: [ RoomController ],
    providers: [ RoomService, RoomHelperService ],
    exports: [ RoomService ]
})
export class RoomModule {}