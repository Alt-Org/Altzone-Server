import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { envVars } from '../service/envHandler/envVars';
import { swaggerDocumentOptions } from './documentSetup/swaggerDocumentOptions';
import { swaggerUIOptions } from './documentSetup/swaggerUIOptions';
import {
  swaggerDescription,
  swaggerTitle,
  swaggerVersion,
} from './documentSetup/introSection';
import { SwaggerDocumentBuilder } from './swaggerDocumentBuilder';
import { SwaggerTag, swaggerTags } from './tags/tags';

export default class SwaggerInitializer {
  static initSwaggerFromDecorators(app: INestApplication) {
    const tagsToAdd: SwaggerTag[] = [];
    for (const tag in swaggerTags) tagsToAdd.push(swaggerTags[tag]);

    const config = new SwaggerDocumentBuilder()
      .setTitle(swaggerTitle)
      .setDescription(swaggerDescription)
      .setVersion(swaggerVersion)
      .addTags(tagsToAdd)
      .addBearerAuth()
      .build();

    const documentFactory = () =>
      SwaggerModule.createDocument(app, config, swaggerDocumentOptions);
    SwaggerModule.setup(
      envVars.SWAGGER_PATH,
      app,
      documentFactory,
      swaggerUIOptions,
    );
  }
}
