import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.ts';
import { trustedOrigins } from './config/origins.config.ts';

/** Creates the Nest app, enables CORS for the web app, and starts listening. */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (trustedOrigins.length > 0) {
    app.enableCors({ origin: trustedOrigins, credentials: true });
  }
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
