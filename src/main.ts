import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {BadRequestException, ValidationPipe} from "@nestjs/common";
import {useContainer, ValidationError} from "class-validator";
import { SwaggerModule } from '@nestjs/swagger';
import { readFile } from 'fs/promises';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // app.enableCors({
    //   origin: [
    //     'https://altzone.netlify.app',
    //     'https://altzone.fi',
    //     'http://localhost:5173'
    //   ],
    //   methods: ["GET", "PUT", "POST", "DELETE"],
    //   allowedHeaders: [
    //     'Content-Type',
    //     'Access-Control-Allow-Origin',
    //     'Authorization'
    //   ],
    //   credentials: true
    // });

    app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, transform: true, exceptionFactory: errorFactory })
    );

    //Let the class-validator use DI system of NestJS
    useContainer(app.select(AppModule), { fallbackOnErrors: true })

    const document = JSON.parse(
    (await readFile(join(process.cwd(), 'swagger.json'))).toString('utf-8')
    )
    SwaggerModule.setup('swagger', app, document);

    /*
    app.use(cookieSession({
        keys: ['fythsopih'] //key for cookie encryption
    }));
    */
    await app.listen(8080);
}
bootstrap();

/**
 * Converts thrown validation errors to Nest BadRequestException with additional errors array used in ValidationExceptionFilter
 * @param errors 
 * @returns 
 */
function errorFactory(errors: ValidationError[]) {
    const messages = extractMessagesFromValidationErrors(errors);
    const err = new BadRequestException({
        statusCode: 400,
        message: messages,
        error: "Bad Request",
        errors: errors
    });

    return err;
}
function extractMessagesFromValidationErrors(errors: ValidationError[]){
    return errors.map(error => Object.values(error.constraints));
}