import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {Clan, ClanSchema} from "./clan.schema";
import {ClanController} from "./clan.controller";
import {ClanService} from "./clan.service";

@Module({
    imports: [MongooseModule.forFeature([{ name: Clan.name, schema: ClanSchema }])],
    controllers: [ClanController],
    providers: [ClanService],
})
export class ClanModule {}