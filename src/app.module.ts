import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ClanModule } from './clan/clan.module';
import { PlayerModule } from './player/player.module';
import { RequestHelperModule } from './requestHelper/requestHelper.module';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthorizationModule } from './authorization/authorization.module';
import { ChatModule } from './chat/chat.module';
import { GameDataModule } from './gameData/gameData.module';
import { GameAnalyticsModule } from './gameAnalytics/gameAnalytics.module';
import { envVars } from './common/service/envHandler/envVars';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { ClanInventoryModule } from './clanInventory/clanInventory.module';
import { ItemMoverModule } from './itemMover/itemMover.module';
import { GameEventsHandlerModule } from './gameEventsHandler/gameEventsHandler.module';
import { RewarderModule } from './rewarder/rewarder.module';
import { StatisticsKeeperModule } from './statisticsKeeper/statisticsKeeper.module';
import { FleaMarketModule } from './fleaMarket/fleaMarket.module';
import { VotingModule } from './voting/voting.module';
import { BullModule } from '@nestjs/bullmq';
import { DailyTasksModule } from './dailyTasks/dailyTasks.module';
import { BoxModule } from './box/box.module';
import { BoxAuthGuard } from './box/auth/boxAuth.guard';
import isTestingSession from './box/util/isTestingSession';
import { ScheduleModule } from '@nestjs/schedule';
import { OnlinePlayersModule } from './onlinePlayers/onlinePlayers.module';
import { ClanShopModule } from './clanShop/clanShop.module';
import { ShopModule } from './shop/shop.module';
import { FeedbackModule } from './feedback/feedback.module';
import { MetadataModule } from './metadata/metadata.module';
import mongoose from 'mongoose';
import { addBoxIdToSchemaPlugin } from './common/plugin/addBoxIdToSchema.plugin';
import { BoxIdFilterInterceptor } from './box/auth/BoxIdFilter.interceptor';
import { LoggerModule } from './common/service/logger/RequestLogger.module';
import { RequestLoggerService } from './common/service/logger/RequestLogger.service';
import { RequestLoggerInterceptor } from './common/service/logger/RequestLogger.interceptor';
import { JukeboxModule } from './jukebox/jukebox.module';
import { FriendshipModule } from './friendship/friendship.module';

// Set up database connection
const mongoUser = envVars.MONGO_USERNAME;
const mongoPassword = envVars.MONGO_PASSWORD;
const mongoHost = envVars.MONGO_HOST;
const mongoPort = envVars.MONGO_PORT;
const dbName = envVars.MONGO_DB_NAME;
const mongoString = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/?replicaSet=rs0`;

// Set up redis connection
const redisHost = envVars.REDIS_HOST;
const redisPort = parseInt(envVars.REDIS_PORT);
const testEnvironmentName = 'TESTING_SESSION';

const authGuardClassToUse = isTestingSession() ? BoxAuthGuard : AuthGuard;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // MongooseModule.forRoot(mongoString, { dbName: dbName }),
    MongooseModule.forRootAsync({
      useFactory: async (): Promise<MongooseModuleOptions> => {
        if (envVars.ENVIRONMENT === testEnvironmentName)
          mongoose.plugin(addBoxIdToSchemaPlugin);

        return {
          uri: mongoString,
          dbName,
        };
      },
    }),
    BullModule.forRoot({
      connection: {
        host: redisHost,
        port: redisPort,
      },
    }),
    GameDataModule,
    ChatModule,

    GameEventsHandlerModule,
    LeaderboardModule,
    DailyTasksModule,
    RewarderModule,
    StatisticsKeeperModule,

    ClanModule,
    PlayerModule,

    ItemMoverModule,
    FleaMarketModule,
    VotingModule,

    ClanInventoryModule,

    ProfileModule,

    AuthModule,
    AuthorizationModule,
    GameAnalyticsModule,

    RequestHelperModule,

    BoxModule,
    OnlinePlayersModule,
    ClanShopModule,
    ShopModule,

    LoggerModule,
    JukeboxModule,

    MetadataModule,
    ...(envVars.ENVIRONMENT === testEnvironmentName ? [FeedbackModule] : []),
    FriendshipModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useFactory: (loggerService: RequestLoggerService) =>
        new RequestLoggerInterceptor(loggerService),
      inject: [RequestLoggerService],
    },
    { provide: APP_GUARD, useClass: authGuardClassToUse },
    ...(isTestingSession()
      ? [{ provide: APP_INTERCEPTOR, useClass: BoxIdFilterInterceptor }]
      : []),
  ],
})
export class AppModule {}
