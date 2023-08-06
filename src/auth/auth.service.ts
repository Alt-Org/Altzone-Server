import { Injectable } from '@nestjs/common';
import {ProfileService} from "../profile/profile.service";
import {MongooseError} from "mongoose";
import {JwtService} from "@nestjs/jwt";
import {ModelName} from "../common/enum/modelName.enum";

@Injectable()
export class AuthService {
    public constructor(
        private readonly profileService: ProfileService,
        private readonly jwtService: JwtService
    ) {
    }

    public signIn = async (username: string, pass: string): Promise<object> | null => {
        const profile = await this.profileService.readOneByConditionWithCollections({username: username}, ModelName.PLAYER);

        //TODO: throw meaningful errors, i.e. !Player => no player found for that profile
        //TODO: password comparison via bcrypt
        if(profile instanceof MongooseError || profile?.password !== pass || (!profile.isSystemAdmin && !profile.Player))
            return null;

        const payload = {
            sub: profile._id,
            username: profile.username,
            player_id: profile.Player?._id
        };
        const accessToken = await this.jwtService.signAsync(payload);

        const { password, isSystemAdmin, ...serializedProfile} = profile.toJSON();

        return {
            ...serializedProfile,
            accessToken
        };
    }
}
