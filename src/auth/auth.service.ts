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
        const profile = await this.profileService.readOneByCondition({username: username});

        //TODO: password comparison via bcrypt
        if(profile instanceof MongooseError || profile?.password !== pass)
            return null;

        const payload = {sub: profile._id, username: profile.username};
        const accessToken = await this.jwtService.signAsync(payload);

        const { password, ...serializedProfile} = profile.toJSON();


        return {
            ...serializedProfile,
            accessToken
        };
    }
}
