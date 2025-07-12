import {Module} from "@nestjs/common";
import {OtpController} from "../controller/otp.controller";

@Module({
    imports: [],
    exports: [],
    controllers: [
        OtpController
    ],
    providers: []
})
export class OtpModule { }