import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export class EnvValidation {
  private static getEnvVariables(filePath: string): string[] {
    if (!fs.existsSync(filePath)) {
      console.error(`Archivo no encontrado: ${filePath}`);
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

    dotenv.config({ path: envPath });

    const envVariables = this.getEnvVariables(envPath);
    const envExampleVariables = this.getEnvVariables(envExamplePath);

    const missingVariables = envExampleVariables.filter(
      variable => !envVariables.includes(variable)
    );

    if (missingVariables.length > 0) {
      console.error(`Faltan las siguientes variables de entorno: ${missingVariables.join(', ')}`);
      process.exit(1);
    } else {
      console.log('Todas las variables de entorno están presentes.');
    }
  }
}

if (require.main === module) {
  EnvValidation.validate();
}
