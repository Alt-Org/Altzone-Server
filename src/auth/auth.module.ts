import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {ProfileModule} from "../profile/profile.module";
import {ApiStateModule} from "../common/apiState/apiState.module";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";

@Module({
  imports: [
      RequestHelperModule,
      ApiStateModule
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
