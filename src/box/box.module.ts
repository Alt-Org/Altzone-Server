import {Module} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {ModelName} from "../common/enum/modelName.enum";
import {BoxSchema} from "./schemas/box.schema";
import {GroupAdminSchema} from "./schemas/groupAdmin.schema";
import {BoxController} from "./box.controller";
import {BoxService} from "./box.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ModelName.BOX, schema: BoxSchema },
            { name: ModelName.GROUP_ADMIN, schema: GroupAdminSchema }
        ])
    ],
    controllers: [
        BoxController
    ],
    providers: [
        BoxService
    ],
    exports: [
        BoxService
    ]
})
export class BoxModule {}
