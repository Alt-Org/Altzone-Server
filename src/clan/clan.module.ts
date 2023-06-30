import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Clan, ClanSchema} from "./clan.schema";
import {ClanController} from "./clan.controller";
import {ClanService} from "./clan.service";
import {isClanExists} from "./decorator/validation/IsClanExists";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {BaseModule} from "../base/base.module";
import {BaseService} from "../base/base.service";

@Module({
    imports: [
        MongooseModule.forFeature([{name: Clan.name,schema: ClanSchema}]),
        RequestHelperModule
    ],
    controllers: [ClanController],
    providers: [
        {provide: ClanService, useClass: ClanService},
        isClanExists],
    exports: [ClanService]
})
export class ClanModule {}