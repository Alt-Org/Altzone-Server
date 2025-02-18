import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";

type AuthTokenPayload = { profile_id: string; player_id: string, box_id: string };

@Injectable()
export default class BoxAuthHandler {
    constructor(
        private readonly jwtService: JwtService
    ) {
    }

    async getGroupAdminToken(authPayload: AuthTokenPayload){
        const payload = {
            profile_id: authPayload.profile_id,
            player_id: authPayload.player_id,
            box_id: authPayload.box_id,
            groupAdmin: true
        };

        return this.jwtService.signAsync(payload);
    }
}
