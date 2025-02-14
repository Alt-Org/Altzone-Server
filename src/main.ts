import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {BadRequestException, ValidationPipe} from "@nestjs/common";
import {useContainer, ValidationError} from "class-validator";
import { SwaggerModule } from '@nestjs/swagger';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { APIError } from './common/controller/APIError';
import { validationToAPIErrors } from './common/exceptionFilter/ValidationExceptionFilter';
import EnvHandler from './common/service/envHandler/envHandler';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    // Validate that all environment variables are added to the .env file
    new EnvHandler().validateAllEnvFound();

    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, transform: true, exceptionFactory: errorFactory })
    );

    //Let the class-validator use DI system of NestJS
    useContainer(app.select(AppModule), { fallbackOnErrors: true })

    const document = JSON.parse(
    (await readFile(join(process.cwd(), 'swagger.json'))).toString('utf-8')
    )
    SwaggerModule.setup('swagger', app, document);
    await app.listen(8080);
}
bootstrap();

/**
 * Converts thrown validation errors to Nest BadRequestException 
 * with a field `errors` containing converted ValidationErrors to APIErrors
 * @param validationErrors thrown errors
 * @returns 
 */
function errorFactory(validationErrors: ValidationError[]) {
    const messages = extractMessagesFromValidationErrors(validationErrors);

    const apiErrors: APIError[] = [];
    for(let i=0, l=validationErrors.length; i<l; i++){
        const errors = validationToAPIErrors(validationErrors[i]);
        apiErrors.push(...errors);
    }

    const err = new BadRequestException({
        statusCode: 400,
        message: messages,
        error: "Bad Request",
        errors: apiErrors
    });

    return err;
}
function extractMessagesFromValidationErrors(errors: ValidationError[]){
    return errors.map(error => Object.values(
        error.constraints ? 
        error.constraints : 
        error.children.map(e => Object.values(e.constraints))
    ));
}