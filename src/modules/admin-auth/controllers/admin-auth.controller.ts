import {Body, Controller, Post} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse} from '@nestjs/swagger';
import {AdminLoginResponseDto} from '../dto/admin-login-response.dto';
import {AdminLoginDto} from '../dto/admin-login.dto';
import {AdminAuthService} from '../services/admin-auth.service';

@ApiTags('Admin Authentication')
@Controller('admin/auth')
export class AdminAuthController {
    constructor(private readonly adminAuthService: AdminAuthService) { }

    @Post('login')
    @ApiOperation({
        summary: 'Admin login',
        description: 'Authenticate admin user and receive JWT token for accessing protected admin endpoints'
    })
    @ApiBody({
        type: AdminLoginDto,
        description: 'Admin credentials'
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        type: AdminLoginResponseDto
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials',
        schema: {
            type: 'object',
            properties: {
                statusCode: {type: 'number', example: 401},
                message: {type: 'string', example: 'Invalid admin credentials'},
                error: {type: 'string', example: 'Unauthorized'},
            },
        },
    })
    async login(@Body() adminLoginDto: AdminLoginDto): Promise<AdminLoginResponseDto> {
        return this.adminAuthService.login(adminLoginDto);
    }
}
