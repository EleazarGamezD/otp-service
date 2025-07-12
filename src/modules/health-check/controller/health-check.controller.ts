import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {HealthCheck} from '@nestjs/terminus';
import {HealthCheckServerService} from '../services/health-check.service';

@ApiTags('Server Health')
@Controller('health-check')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckServerService) {}

  @Get()
  @HealthCheck()
  @ApiTags('Liveness')
  @ApiTags('Server Health')
/*   @ApiBearerAuth('token')
  @Auth(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'))
  @PermissionsDecorator(PermissionsEnum.CREATE_USER) */
  getLiveness() {
    return this.healthCheckService.servicesHealth();
  }
}
