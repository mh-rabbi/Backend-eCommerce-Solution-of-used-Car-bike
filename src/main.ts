import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // CRITICAL FIX: Ensure uploads directory exists
  const uploadDir = join(__dirname, '..', 'uploads');
  if (!existsSync(uploadDir)) {
    console.log('📁 Creating uploads directory:', uploadDir);
    mkdirSync(uploadDir, { recursive: true });
  }
  
  // Serve static files from uploads directory
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });
  
  // CRITICAL FIX: Enhanced CORS for Flutter with multipart/form-data support
  app.enableCors({
    origin: [
      'http://localhost:3001', 
      'http://localhost:3000', 
      'http://localhost:8080',
      // Add your Flutter app's origin (usually the device/emulator IP)
      'http://10.0.2.2:8080', // Android Emulator
      'http://192.168.0.238:8080', // Your physical device IP
      '*' // TEMPORARY: Allow all origins during development (remove in production)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept',
      'Origin',
      'X-Requested-With'
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  // Global validation pipe with better error messages
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    exceptionFactory: (errors) => {
      console.error('❌ Validation errors:', JSON.stringify(errors, null, 2));
      return errors;
    },
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // CRITICAL FIX: Bind to all interfaces
  
  console.log('=================================');
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📁 Uploads directory: ${uploadDir}`);
  console.log(`🌐 CORS enabled for development`);
  console.log('=================================');
}
bootstrap();