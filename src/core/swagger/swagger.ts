import {INestApplication} from '@nestjs/common';
import {setupAdminSwagger} from './admin-swagger';
import {setupPublicSwagger} from './public-swagger';

export function setupSwagger(app: INestApplication) {
  // Setup public API documentation
  setupPublicSwagger(app);

  // Setup admin panel documentation
  setupAdminSwagger(app);
}
