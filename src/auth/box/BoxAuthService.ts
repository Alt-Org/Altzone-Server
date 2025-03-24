import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {InjectModel} from "@nestjs/mongoose";
import {Model, MongooseError} from "mongoose";
import {ModelName} from "../../common/enum/modelName.enum";
import {ProfileDto} from "../../profile/dto/profile.dto";
import {PlayerDto} from "../../player/dto/player.dto";
import {ClanDto} from "../../clan/dto/clan.dto";
import {RequestHelperService} from "../../requestHelper/requestHelper.service";
import {ObjectId} from "mongodb";
import {AuthService} from "../auth.service";
import {Box} from "../../box/schemas/box.schema";
import {GroupAdmin} from "../../box/groupAdmin/groupAdmin.schema";

@Injectable()
export default class BoxAuthService extends AuthService {
    constructor(
        private readonly helperService: RequestHelperService,
        private readonly jwt: JwtService,
        @InjectModel(Box.name) public readonly boxModel: Model<Box>,
        @InjectModel(GroupAdmin.name) public readonly groupAdminModel: Model<GroupAdmin>
    ) {
        super(helperService, jwt);
    }

    /**
     * Generates am auth token for a group admin
     * @param username username of the profile
     * @param pass password of the profile
     * @returns access token and its expiration time, profile, player and clan data if password is valid.
     * null if:
     * - profile is not found, or it was not possible to verify password
     * - or if the password is not valid
     * - or if the profile does not correspond to any box
     */
    public signIn = async (username: string, pass: string) => {
        const profile = await this.helperService.getModelInstanceByCondition<any>(ModelName.PROFILE, {username: username}, ProfileDto, true);

        if (!profile || profile instanceof MongooseError)
            return null;

        const [isValidPassword, errors] = await super.verifyPassword(pass, profile.password);

        if (errors || !isValidPassword)
            return null;

        const player = await this.helperService.getModelInstanceByCondition(ModelName.PLAYER, {profile_id: profile._id}, PlayerDto, true);

        if (player instanceof MongooseError || (!profile.isSystemAdmin && !player))
            return null;

        let box_id: string, groupAdmin = false;
        const box = await this.boxModel.findOne({adminProfile_id: new ObjectId(profile._id)});
        if (!box) {
            const boxWithTester = await this.boxModel.findOne({ 'testers.profile_id': new ObjectId(profile._id) });
            if (!boxWithTester)
                return null;

            box_id = boxWithTester.id.toString();
        } else {
            box_id = box._id.toString();
            groupAdmin = true;
        }

        const payload = {
            profile_id: profile._id,
            player_id: player?._id,
            box_id,
            groupAdmin
        };

        const accessToken = await this.jwt.signAsync(payload);
        const decodedAccessToken: any = this.jwt.decode(accessToken);
        // Extract the expiration time in Unix timestamp format
        const tokenExpires = decodedAccessToken?.exp;

        profile['Player'] = player;
        let clan = null;
        if (player?.clan_id)
            clan = await this.helperService.getModelInstanceById(ModelName.CLAN, player.clan_id, ClanDto);
        if (clan)
            profile['Clan'] = clan;

        const {password: _p, isSystemAdmin: _a, ...serializedProfile} = profile;

        return {
            ...serializedProfile,
            accessToken,
            tokenExpires
        };
    }
}
