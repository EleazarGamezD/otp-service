import {ApiProperty} from '@nestjs/swagger';

export class AdminLoginResponseDto {
    @ApiProperty({
        description: 'JWT access token for admin operations',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    access_token: string;

    @ApiProperty({
        description: 'Token type',
        example: 'Bearer'
    })
    token_type: string;

    @ApiProperty({
        description: 'Token expiration time in seconds',
        example: 3600
    })
    expires_in: number;

    @ApiProperty({
        description: 'Admin user information',
        example: {
            username: 'admin',
            role: 'admin'
        }
    })
    user: {
        username: string;
        role: string;
    };
}
