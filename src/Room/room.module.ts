import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { RequestHelperModule } from "../requestHelper/requestHelper.module";
import { StockModule } from "../stock/stock.module";
import { RoomController } from "./room.controller";
import { RoomService } from "./room.service";
import { RoomSchema } from "./room.schema";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.ROOM, schema: RoomSchema } ]),
        RequestHelperModule
    ],
    controllers: [RoomController],
    providers: [ RoomService],
    exports: [RoomService]
})
export class RoomModule {}