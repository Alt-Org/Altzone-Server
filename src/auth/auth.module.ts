import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {ApiStateModule} from "../common/apiState/apiState.module";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import { JwtModule } from '@nestjs/jwt';
import { envVars } from '../common/service/envHandler/envVars';

@Module({
  imports: [
      RequestHelperModule,
      ApiStateModule,
      JwtModule.register({
        global: true,
        secret: envVars.JWT_SECRET,
        signOptions: { expiresIn: '30d' }
      })
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
