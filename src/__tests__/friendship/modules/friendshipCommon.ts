import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { mongooseOptions, mongoString } from "src/__tests__/test_utils/const/db";
import { ModelName } from "src/common/enum/modelName.enum";
import FriendshipNotifier from "src/friendship/friendship.notifier";
import { FriendshipSchema } from "src/friendship/friendship.schema";
import { FriendshipService } from "src/friendship/friendship.service";
import { PlayerModule } from "src/player/player.module";
import { PlayerSchema } from "src/player/schemas/player.schema";

export default class FriendshipCommonModule {
    private constructor() {}

    private static module: TestingModule;

    static async getModule() {
        if (!FriendshipCommonModule.module)
            FriendshipCommonModule.module = await Test.createTestingModule({
                imports: [
                    MongooseModule.forRoot(mongoString, mongooseOptions),
                    MongooseModule.forFeature([
                        { name: ModelName.FRIENDSHIP, schema: FriendshipSchema },
                        { name: ModelName.PLAYER, schema: PlayerSchema },
                    ]),

                    PlayerModule
                ],
                providers: [FriendshipService],
            }).compile();
            
        return FriendshipCommonModule.module;
    }
}