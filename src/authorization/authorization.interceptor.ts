import {
    CallHandler,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
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

        //if can not make any request with this method
        if(!userAbility.can(requestAction, subject))
            throw requestForbiddenError;

        //if read one or delete one then get identifier from params and check permission before farther request
        //or specify which fields are accessible for read many
        if(action === Action.read || action === Action.delete){
            const { params } = request;

            //if read one
            if(Object.keys(params).length !== 0){
                //@ts-ignore
                const subjectClass: typeof subject = plainToInstance(subject, params);

                if(!userAbility.can(requestAction, subjectClass))
                    throw requestForbiddenError;
            } else {
                const allowedFields = this.getAllowedFields(userAbility, responseAction, new subject());
                if(!allowedFields || allowedFields.length === 0)
                    throw new ForbiddenException(`There is no public fields of these objects accessible for reading`);

                request['allowedFields'] = allowedFields;
            }
        }

        //Filter out all fields that logged user can not update
        //Basically create a new request body
        if(action === Action.update){
            //@ts-ignore
            const dataClass: typeof subject = plainToInstance(subject, request.body);
            if(!userAbility.can(requestAction, dataClass))
                throw requestForbiddenError;

            const allowedFields = this.getAllowedFields(userAbility, responseAction, dataClass);
            if(!allowedFields || allowedFields.length === 0)
                throw requestForbiddenError;

            request.body = pick(dataClass, allowedFields);
        }

        return next.handle().pipe(map((data: any) => {
            //if nothing came or it is an array === read many(serialization is done on request)
            if(!data || Array.isArray(data))
                return data;

            //Create one and read one response object serialization
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

                //get all fields that can be read
                const allowedFields = this.getAllowedFields(userAbility, responseAction, dataClass);
                if((!allowedFields || allowedFields.length === 0) && action === Action.read)
                    throw new ForbiddenException(`The logged user has no permission to execute ${responseAction} action`);

                //return fields only from the array
                return pick(dataClass, allowedFields);
            }

            return data;
        }));
    }

    private getAllowedFields = (ability: MongoAbility, action: SupportedAction, dataClass: object): string[] => {
        const options = { fieldsFrom: rule => rule.fields || Object.keys(dataClass) };
        return permittedFieldsOf(ability, action, dataClass, options);
    }
}