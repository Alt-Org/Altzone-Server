import {
    CallHandler,
    ExecutionContext,
    ForbiddenException,
    Injectable, InternalServerErrorException,
    NestInterceptor,
    UnauthorizedException,
    UseInterceptors
} from "@nestjs/common";
import {Observable} from "rxjs";
import {Action} from "./enum/action.enum";
import {AllowedSubject, CASLAbilityFactory} from "./caslAbility.factory";
import {map} from "rxjs/operators";
import {User} from "../auth/user";
import {plainToInstance} from "class-transformer";
import {ObjectId} from "mongodb";
import {Reflector} from "@nestjs/core";
import {PERMISSION_METADATA} from "./decorator/SetAuthorizationFor";
import {permittedFieldsOf} from "@casl/ability/extra";
import {pick} from "lodash";
import {MongoAbility} from "@casl/ability";

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
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const { user } = request;
        if(!user || !(user instanceof User))
            throw new UnauthorizedException('User must be logged in for that request');

        const metadata = this.reflector.get<PermissionMetaData>(PERMISSION_METADATA, context.getHandler());
        if(!metadata)
            throw new InternalServerErrorException('Permission metadata is not provided. Please provide it with @SetAuthorizationFor()');

        const {action, subject} = metadata;

        const requestAction = Action[action + '_request'];
        const responseAction = Action[action + '_response'];
        const requestForbiddenError = new ForbiddenException(`The logged user has no permission to execute ${requestAction} action`);

        const userAbility = await this.caslAbilityFactory.createForUser(user, subject);

        if(!userAbility.can(requestAction, subject))
            throw requestForbiddenError;

        //TODO: add logic for params as well (read and delete)

        //Update Serialization
        if(action === Action.update){
            //@ts-ignore
            const dataClass: typeof subject = plainToInstance(subject, request.body);
            if(!userAbility.can(requestAction, dataClass))
                throw requestForbiddenError;

            const allowedFields = this.getAllowedFields(userAbility, responseAction, dataClass);
            if(!allowedFields)
                throw requestForbiddenError;

            request.body = pick(dataClass, allowedFields);
        }

        return next.handle().pipe(map((data: any) => {
            if(!data)
                return data;

            //Create and read serialization
            if(action === Action.create || action === Action.read){
                //@ts-ignore
                const dataClass: typeof subject = plainToInstance(subject, data, {
                    excludeExtraneousValues: true
                });
                //@ts-ignore
                const dataClass_id = dataClass._id;

                if(dataClass_id && dataClass_id instanceof ObjectId)
                    //@ts-ignore
                    dataClass._id = dataClass_id.toString();

                //Read Serialization
                const allowedFields = this.getAllowedFields(userAbility, responseAction, dataClass);
                if(!allowedFields)
                    throw new ForbiddenException(`The logged user has no permission to execute ${responseAction} action`);

                return pick(dataClass, allowedFields);
            }

            return data;
        }));
    }

    private getAllowedFields = (ability: MongoAbility, action: SupportedAction, dataClass: object): string[] | null => {
        const options = { fieldsFrom: rule => rule.fields || Object.keys(dataClass) };
        const allowedFields = permittedFieldsOf(ability, action, dataClass, options);
        return allowedFields.length !== 0 ? allowedFields : null;
    }
}