import mongoose from "mongoose";
import { FriendshipService } from "../../../friendship/friendship.service";
import FriendshipCommonModule from "./friendshipCommon";
import FriendshipNotifier from "../../../friendship/friendship.notifier";
import { ModelName } from "../../../common/enum/modelName.enum";
import { FriendshipSchema } from "../../../friendship/friendship.schema";

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