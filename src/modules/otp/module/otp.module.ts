import {BullModule} from "@nestjs/bullmq";
import {Module, forwardRef} from "@nestjs/common";
import {AuthModule} from "../../auth/module/auth.module";
import {ProjectModule} from "../../projects/module/project.module";
import {SharedModule} from "../../shared/shared.module";
import {OtpController} from "../controller/otp.controller";
import {OtpService} from "../otp.service";
import {OtpProcessor} from "../processor/otp.processor";

@Module({
    imports: [
        forwardRef(() => SharedModule),
        forwardRef(() => ProjectModule),
        forwardRef(() => AuthModule),
        BullModule.registerQueue({
            name: 'otp',
        }),
    ],
    controllers: [OtpController],
    providers: [OtpService, OtpProcessor],
    exports: [OtpService],
})
export class OtpModule { }