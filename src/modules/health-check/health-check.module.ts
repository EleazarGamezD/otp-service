import {Module} from '@nestjs/common';
import {TerminusModule} from '@nestjs/terminus';
import {HealthCheckController} from './controller/health-check.controller';
import {HealthCheckServerService} from './services/health-check.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthCheckController],
  providers: [HealthCheckServerService],
})
export class HealthCheckModule {}
