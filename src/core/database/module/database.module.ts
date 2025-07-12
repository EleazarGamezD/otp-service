import {Module} from "@nestjs/common";
import {MongooseModule} from '@nestjs/mongoose';
import {OTP, OTPSchema} from '../schemas/otp/otp.schema';
import {BullModule} from '@nestjs/bullmq';
import {Client, ClientSchema} from "src/core/database/schemas/clients/client.schema";

export const schemas = [
    {name: OTP.name, schema: OTPSchema},
    {name: Client.name, schema: ClientSchema}
];

@Module({
    imports: [
        MongooseModule.forRoot(configuration.mongoUri),
        MongooseModule.forFeature(schemas),
    ],
    BullModule.forRoot({
        connection: {
            host: configuration.redisKeys.host,
            port: configuration.redisKeys.port,
        },
    }),
    BullModule.registerQueue({
        name: configuration.otpKeys.queueName
    }),
    ],
    exports: [MongooseModule, BullModule],
})
export class DatabaseModule { }