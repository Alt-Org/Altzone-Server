import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {CustomCharacterSchema} from "./customCharacter.schema";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {CustomCharacterController} from "./customCharacter.controller";
import {CustomCharacterService} from "./customCharacter.service";
import {isCustomCharacterExists} from "./decorator/validation/IsCustomCharacterExists.decorator";
import { AuthorizationModule } from "../authorization/authorization.module";
import {PlayerSchema} from "../player/player.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: ModelName.CUSTOM_CHARACTER, schema: CustomCharacterSchema},
            {name: ModelName.PLAYER, schema: PlayerSchema}
        ]),
        RequestHelperModule,
        AuthorizationModule
    ],
    controllers: [CustomCharacterController],
    providers: [ CustomCharacterService, isCustomCharacterExists ],
    exports: [CustomCharacterService]
})
export class CustomCharacterModule {}