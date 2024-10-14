import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {ApiStateModule} from "../common/apiState/apiState.module";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
      RequestHelperModule,
      ApiStateModule,
      JwtModule
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
