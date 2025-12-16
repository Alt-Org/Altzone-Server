import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { mongooseOptions, mongoString } from "../../test_utils/const/db";
import { ModelName } from "../../../common/enum/modelName.enum";
import FriendshipNotifier from "../../../friendship/friendship.notifier";
import { FriendshipSchema } from "../../../friendship/friendship.schema";
import { FriendshipService } from "../../../friendship/friendship.service";
import { PlayerModule } from "../../../player/player.module";
import { PlayerSchema } from "../../../player/schemas/player.schema";

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
                providers: [FriendshipService, FriendshipNotifier],
            }).compile();
            
        return FriendshipCommonModule.module;
    }
}