import {
    CallHandler,
    ExecutionContext, ForbiddenException, Injectable,
    NestInterceptor,
    UnauthorizedException,
    UseInterceptors
} from "@nestjs/common";
import {Observable} from "rxjs";
import {Action} from "./enum/action.enum";
import {CASLAbilityFactory, AllowedSubject} from "./caslAbility.factory";
import {map} from "rxjs/operators";
import {User} from "../auth/user";
import {
    instanceToPlain,
    plainToInstance
} from "class-transformer";
import {ObjectId} from "mongodb";
import {Reflector} from "@nestjs/core";
import {PERMISSION_METADATA} from "./decorator/SetAuthorizationFor";
import {permittedFieldsOf} from "@casl/ability/extra";
import {pick} from "lodash";

export type PermissionMetaData = {
    action: SupportedAction,
    subject: AllowedSubject
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

    public async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const {action, subject} = this.reflector.get<PermissionMetaData>(PERMISSION_METADATA, context.getHandler());

        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const { user } = request;
        if(!user || !(user instanceof User))
            throw new UnauthorizedException('User must be logged in for that request');

        const requestAction = Action[action + '_request'];
        const responseAction = Action[action + '_response'];

        const userAbility = await this.caslAbilityFactory.createForUser(user, subject);

        if(!userAbility.can(requestAction, subject))
            throw new ForbiddenException(`The logged user has no permission to execute ${requestAction} action`);

        //Update Serialization
        const allFields = Object.keys(request.body);
        const options = { fieldsFrom: rule => rule.fields || allFields };
        //@ts-ignore
        const dataClass: typeof subject = plainToInstance(subject, request.body) as typeof subject;
        let fields = permittedFieldsOf(userAbility, responseAction, dataClass, options);
        request.body = pick(dataClass, fields);

        return next.handle().pipe(map((data: any) => {
            //@ts-ignore
            const dataClass: typeof subject = plainToInstance(subject, data._doc) as typeof subject;
            //@ts-ignore
            const dataClass_id = dataClass._id;

            if(dataClass_id && dataClass_id instanceof ObjectId)
                //@ts-ignore
                dataClass._id = dataClass_id.toString();

            //Read Serialization
            const allFields = Object.keys(data._doc);
            const options = { fieldsFrom: rule => rule.fields || allFields };
            let fields = permittedFieldsOf(userAbility, responseAction, dataClass, options);

            return pick(dataClass, fields);
        }));
    }
}