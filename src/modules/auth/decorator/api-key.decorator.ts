import { SetMetadata } from '@nestjs/common';
export const ApiKey = () => SetMetadata('apiKeyProtected', true);
