import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {ProfileModule} from "../profile/profile.module";
import {JwtModule} from "@nestjs/jwt";
import {jwtConstants} from "./constant";

@Module({
  imports: [
      ProfileModule,
      JwtModule.register({
        global: true,
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '60s' },
      }),
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
