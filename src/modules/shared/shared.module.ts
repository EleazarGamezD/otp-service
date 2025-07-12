import {DatabaseModule} from "@app/core/database/module/database.module";
import {Module} from "@nestjs/common";
import {AuthModule} from "../auth/module/auth.module";
import {HealthCheckModule} from "../health-check/health-check.module";
import {MailerModule} from "../mail/module/mailer.module";
import {OtpModule} from "../otp/module/otp.module";
import {WhatsappModule} from "../whatsapp/module/whatsapp.module";
const modules = [
    DatabaseModule,
    AuthModule,
    HealthCheckModule,
    MailerModule,
    WhatsappModule,
    OtpModule
];
@Module({
    imports: modules,
    exports: modules,
})

export class SharedModule { }
