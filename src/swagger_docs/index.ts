import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'api-docs';

/**
 * The spec is generated from controllers/DTOs/entities at build time by the
 * @nestjs/swagger CLI plugin (see nest-cli.json), so it stays in sync with code.
 */
export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('GaariHaat API')
    .setDescription('Backend for the used car & bike marketplace.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
