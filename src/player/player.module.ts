import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {PlayerSchema} from "./player.schema";
import PlayerController from "./player.controller";
import {PlayerService} from "./player.service";
import {isPlayerExists} from "./decorator/validation/IsPlayerExists";
import {ClassName} from "../util/dictionary";
import {ClanModule} from "../clan/clan.module";

@Module({
    imports: [
        MongooseModule.forFeature([{name: ClassName.PLAYER, schema: PlayerSchema}]),
        ClanModule
    ],
    controllers: [PlayerController],
    providers: [PlayerService, isPlayerExists],
    exports: [PlayerService]
})
export class PlayerModule {}