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
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';

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

        const errorResponse = {
            statusCode: 401,
            error: 'Unauthorized'
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token)
            throw new UnauthorizedException(
                {...errorResponse, 
                    message: 'The access token is not provided. ' +
                             'Please add `authorization` field with access token(in bearer token form): ' +
                             '`Bearer access-token-here` to request header. The access token you can get from /auth endpoint', 
                    errors: [new APIError({reason: APIErrorReason.NOT_AUTHENTICATED, message: 'The access token is not provided'})]
                }
            );

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: jwtConstants.secret
                }
            );

            const {profile_id, player_id} = payload;
            const isSystemAdmin = await this.systemAdminService.isSystemAdmin(profile_id);

            if(!profile_id || (!isSystemAdmin && !player_id))
                throw new UnauthorizedException(
                    {...errorResponse, 
                        message: 'Incorrect token provided',
                        errors: [new APIError({reason: APIErrorReason.INVALID_AUTH_TOKEN, message: 'Incorrect token provided'})]
                    }
                );

            request['user'] = new User(profile_id, player_id, isSystemAdmin);
        } catch{
            throw new UnauthorizedException(
                {...errorResponse, 
                    message: 'The access token is expired or invalid. ' +
                             'Please update `authorization` field with access token(in bearer token form): ' +
                             '`Bearer access-token-here` in your request header. The access token you can get from /auth endpoint',
                    errors: [new APIError({reason: APIErrorReason.AUTHENTICATION_FAILED, message: 'The access token is expired or invalid'})]
                }
            );
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | null {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : null;
    }
}