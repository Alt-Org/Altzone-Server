import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {BoxUser} from "./BoxUser";
import {IServiceReturn} from "../../common/service/basicService/IService";
import {InjectModel} from "@nestjs/mongoose";
import {Box} from "../schemas/box.schema";
import {Model} from "mongoose";
import {GroupAdmin} from "../groupAdmin/groupAdmin.schema";
import ServiceError from "../../common/service/basicService/ServiceError";
import {SEReason} from "../../common/service/basicService/SEReason";

type AuthTokenPayload = { profile_id: string; player_id: string, box_id: string };

@Injectable()
export default class BoxAuthHandler {
    constructor(
        private readonly jwt: JwtService,
        @InjectModel(Box.name) public readonly boxModel: Model<Box>,
        @InjectModel(GroupAdmin.name) public readonly groupAdminModel: Model<GroupAdmin>
    ) {
    }

    /**
     * Generates am auth token for a group admin
     * @param authPayload
     * @returns auth token for the group admin
     */
    async getGroupAdminToken(authPayload: AuthTokenPayload) {
        const payload = {
            profile_id: authPayload.profile_id,
            player_id: authPayload.player_id,
            box_id: authPayload.box_id,
            groupAdmin: true
        };

        return this.jwt.signAsync(payload);
    }

    /**
     * Checks whenever the logged-in user is a group admin.
     *
     * Notice that the method also checks whenever group admin password corresponding to the user is valid.
     * @param user
     *
     * @returns true if the user is a valid group admin, false if not or ServiceErrors:
     * - NOT_FOUND if the admin password corresponding to the user can not be found, or it is invalid, or if a box for this admin does not exist
     */
    async isGroupAdmin(user: BoxUser): Promise<IServiceReturn<boolean>> {
        if (!user.groupAdmin)
            return [false, null];

        const box = await this.boxModel.findById(user.box_id);
        if (!box)
            return [null, [new ServiceError({
                reason: SEReason.NOT_FOUND,
                field: 'BoxUser.box_id',
                message: 'Box for that group admin is not found'
            })]];

        const admin = await this.groupAdminModel.findOne({password: box.adminPassword});
        if (!admin)
            return [null, [new ServiceError({
                reason: SEReason.NOT_FOUND,
                field: 'GroupAdmin.password',
                message: 'Group admin for that box is not found'
            })]];

        return [true, null];
    }
}
