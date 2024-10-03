import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from "@nestjs/common";
import { APIError } from "../common/controller/APIError";
import { APIErrorReason } from "../common/controller/APIErrorReason";
import { Response } from 'express';

/**
 * Error filter to handle ValidationErrors thrown by FileInterceptor.
 *
 * Filter will convert generic BadRequestException to APIError with reason NOT_ALLOWED
 * as well as send an array with occurred APIError to the client side
 */
@Catch(BadRequestException)
export class FileValidationFilter implements ExceptionFilter {
	catch(exception: BadRequestException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		response.status(400).json({
			statusCode: 400,
			errors: [
                new APIError({
                    reason: APIErrorReason.NOT_ALLOWED, 
                    message: 'The field name containing the file must be "logFile"'
                })
            ]
		});
	}
}