import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import {ClanModule} from "./clan/clan.module";
import {PlayerModule} from "./player/player.module";
import {RequestHelperModule} from "./requestHelper/requestHelper.module";
import {CharacterClassModule} from "./characterClass/characterClass.module";
import {CustomCharacterModule} from "./customCharacter/customCharacter.module";
import {ProfileModule} from "./profile/profile.module";
import { AuthModule } from './auth/auth.module';
import {AuthGuard} from "./auth/auth.guard";
import {APP_GUARD} from "@nestjs/core";
import { AuthorizationModule } from './authorization/authorization.module';
import { PermissionModule } from './permission/permission.module';
import { ApiStateModule } from './common/apiState/apiState.module';
import { SiteModule } from './site/site.module';
import {ChatModule} from "./chat/chat.module";
import { GameDataModule } from './gameData/gameData.module';
import { GameAnalyticsModule } from './gameAnalytics/gameAnalytics.module';
import { PlayerTasksModule } from './playerTasks/playerTasks.module';
import { envVars } from './common/service/envHandler/envVars';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { ClanInventoryModule } from './clanInventory/clanInventory.module';
import { ItemMoverModule } from './itemMover/itemMover.module';

// Set up database connection
const mongoUser = envVars.MONGO_USERNAME;
const mongoPassword = envVars.MONGO_PASSWORD;
const mongoHost = envVars.MONGO_HOST;
const mongoPort = envVars.MONGO_PORT;
const dbName = envVars.MONGO_DB_NAME;
const mongoString = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}`;

// Set up redis connection
const redisPassword = envVars.REDIS_PASSWORD;
const redisHost = envVars.REDIS_HOST;
const redisPort = parseInt(envVars.REDIS_PORT);

@Module({
  imports: [
      MongooseModule.forRoot(mongoString, {dbName: dbName}),
      CacheModule.register({
        isGlobal: true,
        store: redisStore,
        host: redisHost,
        port: redisPort,
        password: redisPassword,
      }),
      ClanModule,
      PlayerModule,
      CharacterClassModule,
      CustomCharacterModule,
      ClanInventoryModule,
      ItemMoverModule,
      ProfileModule,
      SiteModule,
      ChatModule,
      RequestHelperModule,
      AuthModule,
      AuthorizationModule,
      PermissionModule,
      ApiStateModule,
      GameDataModule,
      GameAnalyticsModule,
      PlayerTasksModule,
      LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [
      AppService,
      { provide: APP_GUARD, useClass: AuthGuard }
  ],
})
export class AppModule {
}