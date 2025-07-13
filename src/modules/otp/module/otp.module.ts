import {BullModule} from "@nestjs/bullmq";
import {Module, forwardRef} from "@nestjs/common";
import {SharedModule} from "../../shared/shared.module";
import {OtpController} from "../controller/otp.controller";
import {OtpProcessor} from "../processor/otp.processor";
import {OtpService} from "../service/otp.service";

@Module({
    imports: [
        forwardRef(() => SharedModule),
        BullModule.registerQueue({
            name: 'otp-queue',
        }),
    ],
    controllers: [OtpController],
    providers: [OtpService, OtpProcessor],
    exports: [OtpService],
})
export class OtpModule { }