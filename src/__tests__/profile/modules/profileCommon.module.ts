import {Test, TestingModule} from "@nestjs/testing";
import {MongooseModule} from "@nestjs/mongoose";
import {mongooseOptions, mongoString} from "../../test_utils/const/db";
import {ModelName} from "../../../common/enum/modelName.enum";
import {PlayerModule} from "../../../player/player.module";
import {RequestHelperModule} from "../../../requestHelper/requestHelper.module";
import {ProfileSchema} from "../../../profile/profile.schema";
import {ProfileService} from "../../../profile/profile.service";
import {isProfileExists} from "../../../profile/decorator/validation/IsProfileExists.decorator";

export default class ProfileCommonModule {
    private constructor() {
    }

    private static module: TestingModule;

    static async getModule() {
        if (!ProfileCommonModule.module)
            ProfileCommonModule.module = await Test.createTestingModule({
                imports: [
                    MongooseModule.forRoot(mongoString, mongooseOptions),
                    MongooseModule.forFeature([
                        {name: ModelName.PROFILE, schema: ProfileSchema}
                    ]),

                    PlayerModule,
                    RequestHelperModule
                ],
                providers: [
                    ProfileService, isProfileExists
                ],
            }).compile();

        return ProfileCommonModule.module;
    }
}