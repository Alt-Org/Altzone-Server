import {Test, TestingModule} from '@nestjs/testing';
import {RequestHelperModule} from '../../../requestHelper/requestHelper.module';
import {JwtModule} from "@nestjs/jwt";
import {AuthService} from "../../../auth/auth.service";
import {MongooseModule} from "@nestjs/mongoose";
import {mongooseOptions, mongoString} from "../../test_utils/const/db";


export default class AuthCommonModule {
    private constructor() {
    }

    private static module: TestingModule;

    static async getModule() {
        if (!AuthCommonModule.module)
            AuthCommonModule.module = await Test.createTestingModule({
                imports: [
                    MongooseModule.forRoot(mongoString, mongooseOptions),
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