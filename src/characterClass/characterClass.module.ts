import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {CharacterClassSchema} from "./characterClass.schema";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {ModelName} from "../common/enum/modelName.enum";
import {CharacterClassController} from "./characterClass.controller";
import {CharacterClassService} from "./characterClass.service";
import {isCharacterClassExists} from "./decorator/validation/IsCharacterClassExists.decorator";
import {CustomCharacterModule} from "../customCharacter/customCharacter.module";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.CHARACTER_CLASS, schema: CharacterClassSchema} ]),
        CustomCharacterModule,
        RequestHelperModule
    ],
    controllers: [CharacterClassController],
    providers: [ CharacterClassService, isCharacterClassExists ],
    exports: [CharacterClassService]
})
export class CharacterClassModule {}