import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {PlayerSchema} from "./player.schema";
import PlayerController from "./player.controller";
import {PlayerService} from "./player.service";
import {ClassName} from "../util/dictionary";
import {ClanModule} from "../clan/clan.module";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {isPlayerExists} from "./decorator/validation/IsPlayerExists.decorator";

@Module({
    imports: [
        MongooseModule.forFeature([{name: ClassName.PLAYER, schema: PlayerSchema}]),
        ClanModule,
        RequestHelperModule
    ],
    controllers: [PlayerController],
    providers: [ PlayerService, isPlayerExists ],
    exports: [PlayerService]
})
export class PlayerModule {}