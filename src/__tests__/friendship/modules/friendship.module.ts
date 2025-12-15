import mongoose from "mongoose";
import { FriendshipService } from "src/friendship/friendship.service";
import FriendshipCommonModule from "./friendshipCommon";
import FriendshipNotifier from "src/friendship/friendship.notifier";
import { ModelName } from "src/common/enum/modelName.enum";
import { FriendshipSchema } from "src/friendship/friendship.schema";

export default class FriendshipModule {
    private constructor() {}

    static async getFriendshipService() {
        const module = await FriendshipCommonModule.getModule();
        return await module.resolve(FriendshipService);
    }

    static async getFriendshipNotifier() {
        const module = await FriendshipCommonModule.getModule();
        return await module.resolve(FriendshipNotifier);
    }

    static getFriendshipModel() {
        return mongoose.model(ModelName.FRIENDSHIP, FriendshipSchema);
    }
}