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
import { APIError } from '../controller/APIError';

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
      .addGlobalResponse({
        example: {
          statusCode: 500,
          errors: [
            {
              response: 'UNEXPECTED',
              status: 500,
              message: 'Unexpected error happen',
              name: '',
              reason: 'UNEXPECTED',
              field: 'string',
              value: 'string',
              additional: 'string',
              statusCode: 500,
              objectType: 'APIError',
            },
          ],
        },
        status: 500,
        type: () => APIError,
        description:
          'Unexpected error happened. [Please create a new issue here](https://github.com/Alt-Org/Altzone-Server/issues) and specify the endpoint, HTTP method and description if you have any',
      })
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
