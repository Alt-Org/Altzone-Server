import {Test, TestingModule} from "@nestjs/testing";
import {MongooseModule} from "@nestjs/mongoose";
import {mongooseOptions, mongoString} from "../../test_utils/const/db";
import {ModelName} from "../../../common/enum/modelName.enum";
import {RequestHelperModule} from "../../../requestHelper/requestHelper.module";
import {PlayerSchema} from "../../../player/player.schema";
import {CustomCharacterModule} from "../../../customCharacter/customCharacter.module";
import {PlayerService} from "../../../player/player.service";
import {isPlayerExists} from "../../../player/decorator/validation/IsPlayerExists.decorator";

export default class PlayerCommonModule {
    private constructor() {
    }

    private static module: TestingModule;

    static async getModule() {
        if (!PlayerCommonModule.module)
            PlayerCommonModule.module = await Test.createTestingModule({
                imports: [
                    MongooseModule.forRoot(mongoString, mongooseOptions),
                    MongooseModule.forFeature([{name: ModelName.PLAYER, schema: PlayerSchema}]),
                    CustomCharacterModule,
                    RequestHelperModule
                ],
                providers: [
                    PlayerService, isPlayerExists
                ],
            }).compile();

        return PlayerCommonModule.module;
    }
}