import {Test, TestingModule} from '@nestjs/testing';
import {RequestHelperModule} from '../../../requestHelper/requestHelper.module';
import {JwtModule} from "@nestjs/jwt";
import {AuthService} from "../../../auth/auth.service";
import {MongooseModule} from "@nestjs/mongoose";
import {mongooseOptions, mongoString} from "../../test_utils/const/db";
import {ModelName} from "../../../common/enum/modelName.enum";
import {ProfileSchema} from "../../../profile/profile.schema";
import {PlayerSchema} from "../../../player/player.schema";
import {ClanSchema} from "../../../clan/clan.schema";


export default class AuthCommonModule {
    private constructor() {
    }

    private static module: TestingModule;

    static async getModule() {
        if (!AuthCommonModule.module)
            AuthCommonModule.module = await Test.createTestingModule({
                imports: [
                    MongooseModule.forRoot(mongoString, mongooseOptions),
                    MongooseModule.forFeature([
                        {name: ModelName.PROFILE, schema: ProfileSchema},
                        {name: ModelName.PLAYER, schema: PlayerSchema},
                        {name: ModelName.CLAN, schema: ClanSchema}
                    ]),
                    JwtModule.register({
                        global: true,
                        secret: 'jwt-secret',
                        signOptions: { expiresIn: '30d' }
                    }),
                    RequestHelperModule
                ],
                providers: [
                    AuthService
                ]
            }).compile();

        return AuthCommonModule.module;
    }
}