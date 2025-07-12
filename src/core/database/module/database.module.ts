import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
import {BullModule} from '@nestjs/bullmq';
import {Module} from "@nestjs/common";
import {ConfigModule, ConfigService} from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import {SchemasModule} from '../schemas/module/schemas.module';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('mongoUri'),
            }),
        }),
        SchemasModule,
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
    ],
    exports: [MongooseModule, BullModule, SchemasModule],
})
export class DatabaseModule { }