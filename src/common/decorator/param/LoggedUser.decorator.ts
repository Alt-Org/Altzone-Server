import {createParamDecorator, ExecutionContext} from "@nestjs/common";
import {Request} from "express";
import { APIError } from "../../controller/APIError";
import { APIErrorReason } from "../../controller/APIErrorReason";
import { User } from "../../../auth/user";

/**
 * Get the `user` field from the request object, which is an instance of class `User`.
 * 
 * Notice, that it will throw MISCONFIGURED error if the `user` field is not found, 
 * which may happen only if the controller method or path is decorated with \@NoAuth() 
 */
export const LoggedUser = createParamDecorator((data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    if(!user)
        throw new APIError({
            reason: APIErrorReason.MISCONFIGURED,
            field: 'user',
            value: user,
            message: 'The @User() decorator can not be used on endpoints where authentication is disabled'
        });

    return user;
});