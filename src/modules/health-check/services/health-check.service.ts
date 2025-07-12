import {IConfiguration} from '@app/core/config/IConfig/configuration';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {HealthCheckService, TypeOrmHealthIndicator} from '@nestjs/terminus';

@Injectable()
export class HealthCheckServerService {
  version = {} as IConfiguration['version'];
constructor(
  private health: HealthCheckService,
  private db : TypeOrmHealthIndicator,
  private configService: ConfigService
) {
  this.version = this.configService.get<IConfiguration['version']>('version');
}

  /**
   * Returns the health status of the server.
   * @returns An object containing the health status of the server.
   *   - status: The health status of the server.
   *   - serverVersion: The version of the server.
   *   - info: A message indicating the health status of the server.
   */
  getHealth(): { status: string; serverVersion: string; info: string } {
    return {
      status: 'UP',
      serverVersion: this.version,
      info: 'Server is healthy and running smoothly'
    };
  }
  /**
   * Checks the health of the database.
   * @returns An object containing the health status of the database.
   *   - db: Result of the database health check.
   */
  async checkDatabaseHealth() {
    return this.health.check([
      () => this.db.pingCheck('databaseConnection'),
    ]);
  }

/**
 * Checks the health of various services including the database and server.
 * @returns An object containing the health status of the database and server.
 *   - db: Result of the database health check.
 *   - server: Current server health information.
 */
  async servicesHealth() {

    const dbHealth = await this.checkDatabaseHealth();
    const serverHealth = this.getHealth();
    // add more health checks here
    return {
      db: dbHealth,
      server: serverHealth,
      // add more health checks here
    };
  }
}
