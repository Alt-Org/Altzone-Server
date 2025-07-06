import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { useContainer, ValidationError } from 'class-validator';
import { APIError } from './common/controller/APIError';
import { validationToAPIErrors } from './common/exceptionFilter/ValidationExceptionFilter';
import EnvHandler from './common/service/envHandler/envHandler';
import cookieParser from 'cookie-parser';
import SwaggerInitializer from './common/swagger/swaggerInitializer';
import { envVars } from './common/service/envHandler/envVars';
import basicAuth from 'express-basic-auth';
import { JwtWsAdapter } from './chat/ws.adapter';
import * as http from 'http';

async function bootstrap() {
  // Validate that all environment variables are added to the .env file
  new EnvHandler().validateAllEnvFound();

  const app = await NestFactory.create(AppModule);
  const server = http.createServer(app.getHttpAdapter().getInstance());
  app.useWebSocketAdapter(new JwtWsAdapter(app, server));

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: errorFactory,
    }),
  );

  //Let the class-validator use DI system of NestJS
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  //Add password protection for swagger endpoints
  app.use(
    [`/${envVars.SWAGGER_PATH}`, `/${envVars.SWAGGER_PATH}-json`],
    basicAuth({
      users: { [`${envVars.SWAGGER_USER}`]: `${envVars.SWAGGER_PASSWORD}` },
      challenge: true,
    }),
  );
  SwaggerInitializer.initSwaggerFromDecorators(app);

  await app.init();
  server.listen(8080);
}

bootstrap();

/**
 * Converts thrown validation errors to Nest BadRequestException
 * with a field `errors` containing converted ValidationErrors to APIErrors
 * @param validationErrors thrown errors
 * @returns bad request exception
 */
function errorFactory(validationErrors: ValidationError[]) {
  const apiErrors: APIError[] = [];
  for (let i = 0, l = validationErrors.length; i < l; i++) {
    const errors = validationToAPIErrors(validationErrors[i]);
    apiErrors.push(...errors);
  }

  return new BadRequestException({
    statusCode: 400,
    error: 'Bad Request',
    errors: apiErrors,
  });
}
