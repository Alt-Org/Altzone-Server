import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	BadRequestException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Response } from 'express';
import { APIError } from '../controller/APIError';
import { APIErrorReason } from '../controller/APIErrorReason';
  
/**
 * Error filter to handle ValidationErrors thrown by class-validator module.
 *
 * Filter will convert ValidationError(s) to appropriate APIError(s) 
 * as well as send an array with occurred APIError(s) to the client side
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
	catch(exception: BadRequestException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus();

		const exceptionResponse = exception.getResponse() as { statusCode: number, message: string[], error: string, errors: ValidationError[]}; 
		const validationErrors = exceptionResponse?.errors || [];

		const apiErrors: APIError[] = [];
		for(let i=0, l=validationErrors.length; i<l; i++){
			const errors = validationToAPIErrors(validationErrors[i]);
			apiErrors.push(...errors);
		}
		response.status(status).json({
			statusCode: status,
			errors: apiErrors
		});
	}
}

export function validationToAPIErrors(error: ValidationError): APIError[] {
	if(error instanceof APIError)
		return [error];

	const { property, value, constraints } = error;

	const errors: APIError[] = [];
	for(const constraint in constraints){
		errors.push(new APIError({
			reason: constraintToAPIErrorReason(constraint), 
			statusCode: 400,
			field: property,
			value,
			message: constraints[constraint],
			additional: constraint
		}));
	}

	return errors;
}

function constraintToAPIErrorReason(constraint: string): APIErrorReason{
	const lessThan = [ 'min', 'arrayMinSize', 'minDate', 'minLength', 'arrayNotEmpty', 'isNotEmptyObject' ];
	const moreThan = [ 'max', 'arrayMaxSize', 'maxLength' ];

	if(constraint === 'isNumber' || constraint === 'isInt')
		return APIErrorReason.NOT_NUMBER;

	if(constraint === 'isString')
		return APIErrorReason.NOT_STRING;

	if(constraint === 'notObject')
		return APIErrorReason.NOT_OBJECT;

	if(constraint === 'notDate')
		return APIErrorReason.NOT_DATE;

	if(constraint === 'isArray')
		return APIErrorReason.NOT_ARRAY;

	if(constraint === 'isBoolean')
		return APIErrorReason.NOT_BOOLEAN;

	if(constraint === 'isEnum')
		return APIErrorReason.WRONG_ENUM;

	if(moreThan.includes(constraint))
		return APIErrorReason.MORE_THAN_MAX;

	if(lessThan.includes(constraint))
		return APIErrorReason.LESS_THAN_MIN;

	return APIErrorReason.NOT_ALLOWED;
}