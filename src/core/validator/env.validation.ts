import {Logger} from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export class EnvValidation {
  private static readonly logger = new Logger(EnvValidation.name);

  private static getEnvVariables(filePath: string): string[] {
    if (!fs.existsSync(filePath)) {
      this.logger.error(`Environment file not found: ${filePath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    return lines
      .filter(line => line.trim() && !line.trim().startsWith('#'))
      .map(line => line.split('=')[0].trim());
  }

  static validate(): void {
    const envPath = path.resolve(process.cwd(), '.env');
    const envExamplePath = path.resolve(process.cwd(), '.env.example');

    dotenv.config({path: envPath});

    const envVariables = this.getEnvVariables(envPath);
    const envExampleVariables = this.getEnvVariables(envExamplePath);

    const missingVariables = envExampleVariables.filter(
      variable => !envVariables.includes(variable)
    );

    if (missingVariables.length > 0) {
      this.logger.error(`Missing environment variables: ${missingVariables.join(', ')}`);
      process.exit(1);
    } else {
      this.logger.log('All required environment variables are present.');
    }
  }
}

if (require.main === module) {
  EnvValidation.validate();
}
