import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { RequestHelperModule } from "../requestHelper/requestHelper.module";
import { SoulhomeSchema } from "./soulhome.schema";
import { SoulHomeController } from "./soulhome.controller";
import { SoulHomeService } from "./soulhome.service";
import { RoomModule } from "../Room/room.module";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.SOULHOME, schema: SoulhomeSchema } ]),
        RequestHelperModule,
        RoomModule
    ],
    controllers: [SoulHomeController],
    providers: [ SoulHomeService],
    exports: [SoulHomeService]
})
export class SoulHomeModule {}
