import {Test, TestingModule} from '@nestjs/testing';
import {MongooseModule} from '@nestjs/mongoose';
import {RequestHelperModule} from '../../../requestHelper/requestHelper.module';
import {ModelName} from '../../../common/enum/modelName.enum';
import {mongooseOptions, mongoString} from '../../test_utils/const/db';
import {CustomCharacterSchema} from "../../../customCharacter/customCharacter.schema";
import {AuthorizationModule} from "../../../authorization/authorization.module";
import {CustomCharacterService} from "../../../customCharacter/customCharacter.service";
import {isCustomCharacterExists} from "../../../customCharacter/decorator/validation/IsCustomCharacterExists.decorator";
import {PlayerSchema} from "../../../player/player.schema";


export default class CustomCharacterCommonModule {
    private constructor() {
    }

    private static module: TestingModule;

    static async getModule() {
        if (!CustomCharacterCommonModule.module)
            CustomCharacterCommonModule.module = await Test.createTestingModule({
                imports: [
                    MongooseModule.forRoot(mongoString, mongooseOptions),
                    MongooseModule.forFeature([
                        {name: ModelName.CUSTOM_CHARACTER, schema: CustomCharacterSchema},
                        {name: ModelName.PLAYER, schema: PlayerSchema}
                    ]),

                    AuthorizationModule,
                    RequestHelperModule
                ],
                providers: [
                    CustomCharacterService, isCustomCharacterExists
                ]
            }).compile();

        return CustomCharacterCommonModule.module;
    }
}