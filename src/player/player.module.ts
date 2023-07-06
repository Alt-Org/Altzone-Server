import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {PlayerSchema} from "./player.schema";
import PlayerController from "./player.controller";
import {PlayerService} from "./player.service";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {isPlayerExists} from "./decorator/validation/IsPlayerExists.decorator";
import {ClanModule} from "../clan/clan.module";
import {ModelName} from "../common/enum/modelName.enum";
import {CustomCharacterModule} from "../customCharacter/customCharacter.module";
import {RaidRoomModule} from "../raidRoom/raidRoom.module";

@Module({
    imports: [
        MongooseModule.forFeature([{name: ModelName.PLAYER, schema: PlayerSchema}]),
        ClanModule,
        CustomCharacterModule,
        RaidRoomModule,
        RequestHelperModule
    ],
    controllers: [PlayerController],
    providers: [ PlayerService, isPlayerExists ],
    exports: [PlayerService]
})
export class PlayerModule {}