import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {ProfileModule} from "../profile/profile.module";

@Module({
  imports: [
      ProfileModule
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
