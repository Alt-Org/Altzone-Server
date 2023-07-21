import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import {ClanModule} from "./clan/clan.module";
import {PlayerModule} from "./player/player.module";
import {RequestHelperModule} from "./requestHelper/requestHelper.module";
import {CharacterClassModule} from "./characterClass/characterClass.module";
import {FurnitureModule} from "./furniture/furniture.module";
import {CustomCharacterModule} from "./customCharacter/customCharacter.module";
import {RaidRoomModule} from "./raidRoom/raidRoom.module";
import {ServeStaticModule} from "@nestjs/serve-static";
import { join } from 'path';
import {ProfileModule} from "./profile/profile.module";
import { AuthModule } from './auth/auth.module';
import {AuthGuard} from "./auth/auth.guard";
import {APP_GUARD} from "@nestjs/core";
import {JwtModule} from "@nestjs/jwt";
import {jwtConstants} from "./auth/constant";

// Set up database connection
const mongoUser = process.env.MONGO_USERNAME || 'rootUser';
const mongoPassword = process.env.MONGO_PASSWORD || 'superSecretPassword';
const mongoHost = process.env.MONGO_HOST || '127.0.0.1';
const mongoPort = process.env.MONGO_PORT || '27017';
const dbName = process.env.MONGO_DB_NAME || 'altzone_dev';
const mongoString = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}`;

@Module({
  imports: [
      MongooseModule.forRoot(mongoString, {dbName: dbName}),
      ClanModule,
      PlayerModule,
      CharacterClassModule,
      CustomCharacterModule,
      FurnitureModule,
      RaidRoomModule,
      ProfileModule,

      RequestHelperModule,
      ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'public'),
      }),
      AuthModule,
      JwtModule.register({
          global: true,
          secret: jwtConstants.secret,
          signOptions: { expiresIn: jwtConstants.expiresIn },
      }),
  ],
  controllers: [AppController],
  providers: [
      AppService,
      { provide: APP_GUARD, useClass: AuthGuard }
  ],
})
export class AppModule {
}