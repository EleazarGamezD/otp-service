import {IClientAuthResponse, IClientChangePasswordRequest, IClientLoginRequest, IClientProfileResponse, IClientRegisterRequest} from '@app/core/interfaces/client-auth/client-auth.interface';
import {ConflictException, Inject, Injectable, UnauthorizedException, forwardRef} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectModel} from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import {randomBytes} from 'crypto';
import {Model} from 'mongoose';
import {Client} from '../../../core/database/schemas/clients/client.schema';
import {ProjectService} from '../../projects/service/project.service';

@Injectable()
export class ClientAuthService {
    constructor(
        @InjectModel(Client.name) private clientModel: Model<Client>,
        private jwtService: JwtService,
        @Inject(forwardRef(() => ProjectService))
        private projectService: ProjectService,
    ) { }

    /**
     * Generate a test API key with test_ prefix
     */
    private generateTestApiKey(): string {
        const randomKey = randomBytes(32).toString('hex');
        return `test_${randomKey}`;
    }

    /**
     * Hash password with bcrypt
     */
    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    }

    /**
     * Compare password with hash
     */
    private async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Validate password strength
     */
    private validatePassword(password: string): void {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }

        if (!hasUpperCase) {
            throw new Error('La contraseña debe contener al menos una letra mayúscula');
        }

        if (!hasLowerCase) {
            throw new Error('La contraseña debe contener al menos una letra minúscula');
        }

        if (!hasNumbers) {
            throw new Error('La contraseña debe contener al menos un número');
        }

        if (!hasSpecialChar) {
            throw new Error('La contraseña debe contener al menos un carácter especial');
        }
    }

    /**
     * Generate JWT token for client
     */
    private generateJwtToken(client: Client): string {
        const payload = {
            sub: client._id,
            email: client.email,
            role: client.role,
            type: 'client'
        };

        return this.jwtService.sign(payload, {
            expiresIn: '30d', // Token válido por 30 días
        });
    }

    /**
     * Format client response
     */
    private formatClientResponse(client: any): IClientAuthResponse['client'] {
        return {
            id: client._id.toString(),
            companyName: client.companyName,
            email: client.email,
            role: client.role,
            apiKey: client.apiKey,
            isActive: client.isActive
        };
    }

    /**
     * Register a new client
     */
    async register(registerRequest: IClientRegisterRequest): Promise<IClientAuthResponse> {
        // Validate password strength
        this.validatePassword(registerRequest.password);

        // Check if email already exists
        const existingClient = await this.clientModel.findOne({
            email: registerRequest.email.toLowerCase()
        });

        if (existingClient) {
            throw new ConflictException('El email ya está registrado');
        }

        // Check if company name already exists
        const existingCompany = await this.clientModel.findOne({
            companyName: registerRequest.companyName
        });

        if (existingCompany) {
            throw new ConflictException('El nombre de la empresa ya está registrado');
        }

        // Hash password
        const hashedPassword = await this.hashPassword(registerRequest.password);

        // Generate test API key
        const apiKey = this.generateTestApiKey();

        // Create new client
        const newClient = new this.clientModel({
            companyName: registerRequest.companyName,
            email: registerRequest.email.toLowerCase(),
            password: hashedPassword,
            role: 'customer',
            apiKey: apiKey,
            isActive: true
        });

        const savedClient = await newClient.save();

        // Generate JWT token
        const accessToken = this.generateJwtToken(savedClient);

        return {
            accessToken,
            client: this.formatClientResponse(savedClient)
        };
    }

    /**
     * Login client
     */
    async login(loginRequest: IClientLoginRequest): Promise<IClientAuthResponse> {
        // Find client by email
        const client = await this.clientModel.findOne({
            email: loginRequest.email.toLowerCase()
        });

        if (!client) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Check if client is active
        if (!client.isActive) {
            throw new UnauthorizedException('Cuenta desactivada. Contacte al administrador');
        }

        // Verify password
        const isPasswordValid = await this.comparePassword(loginRequest.password, client.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Generate JWT token
        const accessToken = this.generateJwtToken(client);

        return {
            accessToken,
            client: this.formatClientResponse(client)
        };
    }

    /**
     * Get client profile
     */
    async getProfile(clientId: string): Promise<IClientProfileResponse> {
        const client = await this.clientModel.findById(clientId);

        if (!client) {
            throw new UnauthorizedException('Cliente no encontrado');
        }

        // Obtener estadísticas de proyectos
        const projects = await this.projectService.getProjectsByClientId(client._id as any);
        const activeProjects = projects.filter(p => p.isActive);
        const totalTokens = projects.reduce((sum, p) => sum + p.tokens, 0);
        const totalTokensUsed = projects.reduce((sum, p) => sum + p.tokensUsed, 0);

        return {
            id: (client._id as any).toString(),
            companyName: client.companyName,
            email: client.email,
            role: client.role,
            apiKey: client.apiKey,
            isActive: client.isActive,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
            totalProjects: projects.length,
            activeProjects: activeProjects.length,
            totalTokensAcrossProjects: totalTokens,
            totalTokensUsedAcrossProjects: totalTokensUsed,
        };
    }

    /**
     * Change client password
     */
    async changePassword(clientId: string, changePasswordRequest: IClientChangePasswordRequest): Promise<{message: string}> {
        const client = await this.clientModel.findById(clientId);

        if (!client) {
            throw new UnauthorizedException('Cliente no encontrado');
        }

        // Verify current password
        const isCurrentPasswordValid = await this.comparePassword(
            changePasswordRequest.currentPassword,
            client.password
        );

        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Contraseña actual incorrecta');
        }

        // Validate new password strength
        this.validatePassword(changePasswordRequest.newPassword);

        // Hash new password
        const hashedNewPassword = await this.hashPassword(changePasswordRequest.newPassword);

        // Update password
        await this.clientModel.findByIdAndUpdate(clientId, {
            password: hashedNewPassword,
            updatedAt: new Date()
        });

        return {message: 'Contraseña actualizada exitosamente'};
    }

    /**
     * Validate JWT token and return client
     */
    async validateToken(payload: any): Promise<Client> {
        const client = await this.clientModel.findById(payload.sub);

        if (!client || !client.isActive) {
            throw new UnauthorizedException('Token inválido o cliente inactivo');
        }

        return client;
    }
}
