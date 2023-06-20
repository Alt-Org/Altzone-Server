import {Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import {ClanModule} from "./clan/clan.module";

// Set up database connection
const mongoUser = process.env.MONGO_USERNAME || 'rootUser';
const mongoPassword = process.env.MONGO_PASSWORD || 'superSecretPassword';
const mongoHost = process.env.MONGO_HOST || '127.0.0.1';
const mongoPort = process.env.MONGO_PORT || '27017';
const dbName = process.env.MONGO_DB_NAME || 'altzone_dev';
const mongoString = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}`;

// - HOST=altzone_api_dev
// #      - PORT=8080
// #      - MONGO_USERNAME=rootUser
// #      - MONGO_PASSWORD=superSecretPassword
// #      - MONGO_HOST=altzone_db_dev
//       - MONGO_PORT=27017
//       - MONGO_DB_NAME=altzone_dev

@Module({
  imports: [
      MongooseModule.forRoot(mongoString, {dbName: dbName}),
      ClanModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}