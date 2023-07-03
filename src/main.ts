import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import {useContainer} from "class-validator";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true })
  );

  //Let the class-validator use DI system of NestJS
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  /*
  app.use(cookieSession({
      keys: ['fythsopih'] //key for cookie encryption
  }));

  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
  );*/
  await app.listen(8080)
}
bootstrap();
