import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {FurnitureSchema} from "./furniture.schema";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {ModelName} from "../common/enum/modelName.enum";
import {FurnitureController} from "./furniture.controller";
import {FurnitureService} from "./furniture.service";
import {isFurnitureExists} from "./decorator/validation/IsFurnitureExists.decorator";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.FURNITURE, schema: FurnitureSchema} ]),
        RequestHelperModule
    ],
    controllers: [FurnitureController],
    providers: [ FurnitureService, isFurnitureExists ],
    exports: [FurnitureService]
})
export class FurnitureModule {}