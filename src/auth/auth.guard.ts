import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constant';
import { Request } from 'express';
import {Reflector} from "@nestjs/core";
import {NO_AUTH_REQUIRED} from "./decorator/NoAuth.decorator";
import {User} from "./user";
import {SystemAdminService} from "../common/apiState/systemAdmin.service";

//TODO: remove or change error messages to less specific for production

@Injectable()
export class AuthGuard implements CanActivate {
    public constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
        private readonly systemAdminService: SystemAdminService
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const noAuthRequired = this.reflector.getAllAndOverride(NO_AUTH_REQUIRED, [
            context.getHandler(),
            context.getClass()
        ]);
        if(noAuthRequired)
            return true;

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token)
            throw new UnauthorizedException(
                'The access token is not provided. ' +
                'Please add `authorization` field with access token(in bearer token form): ' +
                '`Bearer access-token-here` to request header. The access token you can get from /auth endpoint'
            );

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: jwtConstants.secret
                }
            );

            const {profile_id, player_id, clan_id} = payload;
            const isSystemAdmin = await this.systemAdminService.isSystemAdmin(profile_id);

            if(!profile_id || (!isSystemAdmin && !player_id))
                throw new Error('Incorrect token provided');

            request['user'] = new User(profile_id, player_id, clan_id, isSystemAdmin);
        } catch{
            throw new UnauthorizedException(
                'The access token is expired or invalid. ' +
                'Please update `authorization` field with access token(in bearer token form): ' +
                '`Bearer access-token-here` in your request header. The access token you can get from /auth endpoint'
            );
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | null {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : null;
    }
}