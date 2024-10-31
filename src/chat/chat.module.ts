import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ChatSchema} from "./chat.schema";
import {ChatController} from "./chat.controller";
import {ChatService} from "./chat.service";
import {isChatExists} from "./decorator/validation/IsChatExists.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import { GameEventsBrokerModule } from '../gameEventsBroker/gameEventsBroker.module';

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.CHAT, schema: ChatSchema} ]),
        RequestHelperModule,
        GameEventsBrokerModule
    ],
    controllers: [ChatController],
    providers: [ ChatService, isChatExists ],
    exports: [ChatService]
})
export class ChatModule {}