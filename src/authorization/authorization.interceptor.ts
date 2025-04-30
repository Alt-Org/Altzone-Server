import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Action } from './enum/action.enum';
import { AllowedSubject, CASLAbilityFactory } from './caslAbility.factory';
import { map } from 'rxjs/operators';
import { User } from '../auth/user';
import { plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { Reflector } from '@nestjs/core';
import { PERMISSION_METADATA } from './decorator/SetAuthorizationFor';
import { permittedFieldsOf, PermittedFieldsOptions } from '@casl/ability/extra';
import { pick } from 'lodash';
import { MongoAbility } from '@casl/ability';
import { IResponseShape } from '../common/interface/IResponseShape';
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';

export type PermissionMetaData = {
  action: SupportedAction;
  subject: AllowedSubject;
};
export type SupportedAction =
  | Action.create
  | Action.read
  | Action.update
  | Action.delete;

export function CheckPermissions() {
  return UseInterceptors(AuthorizationInterceptor);
}

@Injectable()
export class AuthorizationInterceptor implements NestInterceptor {
  public constructor(
    private readonly caslAbilityFactory: CASLAbilityFactory,
    private readonly reflector: Reflector,
  ) {}

  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const { user } = request;

    if (!user || !(user instanceof User))
      throw new UnauthorizedException({
        message: 'User must be logged in for that request',
        errors: [
          new APIError({
            reason: APIErrorReason.NOT_AUTHENTICATED,
            message: 'Credentials for that profile are incorrect',
          }),
        ],
        statusCode: 401,
        error: 'Unauthorized',
      });

    const metadata = this.reflector.get<PermissionMetaData>(
      PERMISSION_METADATA,
      context.getHandler(),
    );

    if (!metadata)
      throw new InternalServerErrorException({
        message:
          'Permission metadata is not provided. Please provide it with @SetAuthorizationFor()',
        errors: [
          new APIError({
            reason: APIErrorReason.MISCONFIGURED,
            message:
              'Permission metadata is not provided. Please provide it with @SetAuthorizationFor()',
          }),
        ],
        statusCode: 500,
        error: 'Internal Server Error',
      });

    const { action, subject } = metadata;

    const requestAction = Action[action + '_request'];
    const responseAction = Action[action + '_response'];

    const requestForbiddenError = new ForbiddenException({
      message: `The logged-in user has no permission to execute ${requestAction} action`,
      errors: [
        new APIError({
          reason: APIErrorReason.NOT_AUTHORIZED,
          message: `The logged-in user has no permission to execute ${requestAction} action`,
        }),
      ],

      statusCode: 403,
      error: 'Forbidden',
    });

    //Determine subject to be manipulated
    let subjectObj: any = {};
    if (action === Action.read || action === Action.delete)
      subjectObj['_id'] = request.params._id;
    else if (action === Action.update) subjectObj = request.body;

    const userAbility = await this.caslAbilityFactory.createForUser(
      user,
      subject,
      action,
      subjectObj,
    );

    //if can not make any request with this method
    if (!userAbility?.can(requestAction, subject)) throw requestForbiddenError;

    //check if user is trying to create subject for another user
    //For example character with player_id different from that logged-in user has
    if (action === Action.create) {
      //@ts-expect-error: The `plainToInstance` function may not strictly match the expected type of `subject` at runtime
      const dataClass: typeof subject = plainToInstance(subject, request.body);
      if (dataClass && !userAbility.can(requestAction, dataClass))
        throw requestForbiddenError;
    }

    //if read one or delete one then get identifier from params and check permission before farther request
    //or specify which fields are accessible for read many
    const { params } = request;
    if (action === Action.read || action === Action.delete) {
      //if read one
      if (Object.keys(params).length !== 0) {
        //@ts-expect-error: The `plainToInstance` function may not strictly match the expected type of `subject` at runtime
        const subjectClass: typeof subject = plainToInstance(subject, params);

        if (
          action === Action.delete &&
          !userAbility.can(requestAction, subjectClass)
        )
          throw requestForbiddenError;

        if (!userAbility.can(requestAction, subjectClass))
          throw requestForbiddenError;
      } else {
        request['allowedFields'] = this.getAllowedFields(
          userAbility,
          responseAction,
          new subject(),
          subject,
        );
      }
    }

    //Filter out all fields that logged user can not update
    //Basically create a new request body
    if (action === Action.update) {
      //@ts-expect-error: The `plainToInstance` function may not strictly match the expected type of `subject` at runtime
      const dataClass: typeof subject = plainToInstance(subject, request.body);
      if (!userAbility.can(requestAction, dataClass))
        throw requestForbiddenError;

      const allowedFields = this.getAllowedFields(
        userAbility,
        requestAction,
        dataClass,
        subject,
      );
      //Add _id field, because it may not appear in case it is not specified in rule => it will be excluded from body
      allowedFields.push('_id');
      if (!allowedFields || allowedFields.length === 0)
        throw requestForbiddenError;

      request.body = pick(dataClass, allowedFields);
    }

    return next.handle().pipe(
      map(async (data: any) => {
        //if nothing came, or it is an array === read many(serialization is done on request)
        if (!data) return data;

        const dataParsed = (await data) as IResponseShape;

        //it is an array === read many(serialization is done on request)
        if (
          !dataParsed ||
          !dataParsed.metaData ||
          !data.metaData?.dataType ||
          dataParsed.metaData.dataType === 'Array'
        )
          return data;

        const { dataKey } = dataParsed.metaData;
        const respData = dataParsed.data[dataKey];
        if (!respData) return data;

        //Create one and read one response object serialization
        if (action === Action.create || action === Action.read) {
          // @ts-expect-error Ensure the response data is properly serialized and filtered
          const dataClass: typeof subject = plainToInstance(subject, respData, {
            excludeExtraneousValues: true,
          });
          //@ts-expect-error: The `plainToInstance` function may not strictly match the expected type of `subject` at runtime
          const dataClass_id = dataClass._id;

          if (dataClass_id && dataClass_id instanceof ObjectId)
            //@ts-expect-error: The `_id` property may not strictly match the expected type of `dataClass_id` at runtime
            dataClass._id = dataClass_id.toString();

          //get all fields that can be read
          let allowedFields = this.getAllowedFields(
            userAbility,
            responseAction,
            new subject(),
            subject,
          );
          if (!allowedFields || allowedFields.length === 0)
            allowedFields = Object.keys(dataClass);

          //return fields only from the array
          dataParsed.data[dataKey] = pick(dataClass, allowedFields);
        }

        return dataParsed;
      }),
    );
  }

  private getAllowedFields = (
    ability: MongoAbility,
    action: SupportedAction,
    dataClass: object,
    subject: AllowedSubject,
  ): string[] => {
    const options: PermittedFieldsOptions<any> = {
      fieldsFrom: (rule) => {
        if (rule.fields && rule.fields.length !== 0) return rule.fields;

        const foundKeys = Object.keys(dataClass);
        const areKeysInvalid =
          foundKeys.length === 0 ||
          (foundKeys.length === 1 && foundKeys[0] === 'objectType');

        return !areKeysInvalid
          ? foundKeys
          : Object.keys(plainToInstance(subject, new subject()));
      },
    };
    return permittedFieldsOf(ability, action, dataClass, options);
  };
}
