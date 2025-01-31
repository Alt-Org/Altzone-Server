import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {PlayerSchema} from "./player.schema";
import PlayerController from "./player.controller";
import {PlayerService} from "./player.service";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {isPlayerExists} from "./decorator/validation/IsPlayerExists.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {CustomCharacterSchema} from "./customCharacter/customCharacter.schema";
import {AuthorizationModule} from "../authorization/authorization.module";
import {CustomCharacterController} from "./customCharacter/customCharacter.controller";
import {CustomCharacterService} from "./customCharacter/customCharacter.service";
import {isCustomCharacterExists} from "./customCharacter/decorator/validation/IsCustomCharacterExists.decorator";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: ModelName.PLAYER, schema: PlayerSchema},
            {name: ModelName.CUSTOM_CHARACTER, schema: CustomCharacterSchema}
        ]),
        RequestHelperModule,
        AuthorizationModule
    ],
    controllers: [PlayerController, CustomCharacterController],
    providers: [
        PlayerService, isPlayerExists,
        CustomCharacterService, isCustomCharacterExists
    ],
    exports: [PlayerService, CustomCharacterService]
})
export class PlayerModule {}