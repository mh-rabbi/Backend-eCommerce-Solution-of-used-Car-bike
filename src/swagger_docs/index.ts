import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { openApiDocument } from './openapi.document';

export const SWAGGER_PATH = 'api-docs';

export function setupSwagger(app: INestApplication) {
  SwaggerModule.setup(SWAGGER_PATH, app, openApiDocument, {
    swaggerOptions: { persistAuthorization: true },
  });
}
