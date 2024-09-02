import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { SoulhomeSchema } from "./soulhome.schema";
import { SoulHomeController } from "./soulhome.controller";
import { SoulHomeService } from "./soulhome.service";
import { RoomModule } from "../room/room.module";
import { RequestHelperModule } from "../requestHelper/requestHelper.module";
import { PlayerSchema } from "../player/player.schema";
import SoulHomeHelperService from "./utils/soulHomeHelper.service";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.SOULHOME, schema: SoulhomeSchema } ]),
        MongooseModule.forFeature([ {name: ModelName.PLAYER, schema: PlayerSchema } ]),
        RoomModule,
        RequestHelperModule
    ],
    controllers: [ SoulHomeController ],
    providers: [ SoulHomeService, SoulHomeHelperService ],
    exports: [ SoulHomeService ]
})
export class SoulHomeModule {}
