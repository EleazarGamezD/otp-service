import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
import {BullModule} from '@nestjs/bullmq';
import {Module} from "@nestjs/common";
import {ConfigModule, ConfigService} from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import {Client, ClientSchema} from "src/core/database/schemas/clients/client.schema";
import {OTP, OTPSchema} from '../schemas/otp/otp.schema';

export const schemas = [
    {name: OTP.name, schema: OTPSchema},
    {name: Client.name, schema: ClientSchema}
];

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('mongoUri'),
            }),
        }),
        MongooseModule.forFeature(schemas),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const redisConfig = configService.get<IConfiguration['redisKeys']>('redisKeys');
                return {
                    connection: {
                        host: redisConfig?.host,
                        port: redisConfig?.port,
                    },
                };
            },
        }),
        BullModule.registerQueueAsync({
            name: 'otp-queue',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const otpConfig = configService.get<IConfiguration['otpKeys']>('otpKeys');
                return {
                    name: otpConfig?.queueName || 'otp-queue',
                };
            },
        }),
    ],
    exports: [MongooseModule, BullModule],
})
export class DatabaseModule { }