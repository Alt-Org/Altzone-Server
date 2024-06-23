import {Injectable} from '@nestjs/common';
import {MongooseError} from "mongoose";
import {JwtService} from "@nestjs/jwt";
import {ModelName} from "../common/enum/modelName.enum";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {ProfileDto} from "../profile/dto/profile.dto";
import {PlayerDto} from "../player/dto/player.dto";
import {ClanDto} from "../clan/dto/clan.dto";

@Injectable()
export class AuthService {
    public constructor(
        private readonly requestHelperService: RequestHelperService,
        private readonly jwtService: JwtService
    ) {
    }

    public signIn = async (username: string, pass: string): Promise<object> | null => {
        const profile = await this.requestHelperService.getModelInstanceByCondition<any>(ModelName.PROFILE, {username: username}, ProfileDto, true);

        //TODO: password comparison via bcrypt
        if(!profile || profile instanceof MongooseError || profile?.password !== pass)
            return null;

        const player = await this.requestHelperService.getModelInstanceByCondition(ModelName.PLAYER, {profile_id: profile._id}, PlayerDto, true);

        //TODO: throw meaningful errors, i.e. !player => no player found for that profile
        if(player instanceof MongooseError || (!profile.isSystemAdmin && !player))
            return null;

        const payload = {
            profile_id: profile._id,
            player_id: player?._id
        };
        const accessToken = await this.jwtService.signAsync(payload);
        const decodedAccessToken: any = this.jwtService.decode(accessToken);
        // Extract the expiration time in Unix timestamp format
        const tokenExpires = decodedAccessToken?.exp;

        profile['Player'] = player;
        let clan = null;
        if(player?.clan_id)
            clan = await this.requestHelperService.getModelInstanceById(ModelName.CLAN, player.clan_id, ClanDto);
        if(clan)
            profile['Clan'] = clan;

        const { password, isSystemAdmin, ...serializedProfile} = profile;

        return {
            ...serializedProfile,
            accessToken,
            tokenExpires
        };
    }

    private getTokenExpirationTime(token: string){
        const decodedAccessToken: any = this.jwtService.decode(token);
        // Extract the expiration time in Unix timestamp format
        const expiresIn = decodedAccessToken?.exp;
        const diffInSeconds = expiresIn - Math.floor(Date.now() / 1000);
        // Convert the Unix timestamp to a Date object
        // return expiresIn ? new Date(expiresIn * 1000) : null;
        return diffInSeconds ? diffInSeconds : null;
    }
}
