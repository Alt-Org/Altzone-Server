import {
    CallHandler,
    ExecutionContext, ForbiddenException, Injectable,
    NestInterceptor,
    UnauthorizedException,
    UseInterceptors
} from "@nestjs/common";
import {Observable} from "rxjs";
import {Action} from "./enum/action.enum";
import {CASLAbilityFactory, SupportedSubject} from "./caslAbility.factory";
import {map} from "rxjs/operators";
import {User} from "../auth/user";
import {
    plainToInstance
} from "class-transformer";
import {ObjectId} from "mongodb";
import {Reflector} from "@nestjs/core";
import {PERMISSION_METADATA} from "./decorator/SetAuthorizationFor";

export type PermissionMetaData = {
    action: SupportedAction,
    subject: SupportedSubject
};
type SupportedAction = Action.create | Action.read | Action.update | Action.delete;

export function Authorize() {
    return UseInterceptors(AuthorizationInterceptor);
}

@Injectable()
export class AuthorizationInterceptor implements NestInterceptor{
    public constructor(
        private readonly caslAbilityFactory: CASLAbilityFactory,
        private readonly reflector: Reflector,
    ) {
    }

    public intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
        const {action, subject} = this.reflector.get<PermissionMetaData>(PERMISSION_METADATA, context.getHandler());

        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const { user } = request;
        if(!user || !(user instanceof User))
            throw new UnauthorizedException('User must be logged in for that request');

        const requestAction = Action[action + '_request'];
        const responseAction = Action[action + '_response'];

        const userAbility = this.caslAbilityFactory.createForUser(user, subject);

        if(!userAbility.can(requestAction, subject))
            throw new ForbiddenException('The logged user has not permission to execute this action');

        return next.handle().pipe(map((data: any) => {
            //@ts-ignore
            const dataClass: typeof this.subject = plainToInstance(this.subject, data._doc);
            //@ts-ignore
            const dataClass_id = dataClass._id;

            if(dataClass_id && dataClass_id instanceof ObjectId)
                //@ts-ignore
                dataClass._id = dataClass_id.toString();

            if(!userAbility.can(responseAction, dataClass))
                throw new ForbiddenException('The logged user has not permission to execute this action');

            return data;
        }));
    }
}