import {DatabaseModule} from "@app/core/database/module/database.module";
import {BullModule} from "@nestjs/bullmq";
import {Module} from "@nestjs/common";
import {OtpController} from "../controller/otp.controller";
import {OtpProcessor} from "../processor/otp.processor";
import {OtpService} from "../service/otp.service";

@Module({
    imports: [
        DatabaseModule,
        BullModule.registerQueue({
            name: 'otp-queue',
        }),
    ],
    controllers: [OtpController],
    providers: [OtpService, OtpProcessor],
    exports: [OtpService],
})
export class OtpModule { }