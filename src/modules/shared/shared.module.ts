import {DatabaseModule} from "@app/core/database/module/database.module";
import {Module, forwardRef} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {AuthModule} from "../auth/module/auth.module";
import {ClientModule} from "../clients/module/client.module";
import {HealthCheckModule} from "../health-check/health-check.module";
import {MailerModule} from "../mail/module/mailer.module";
import {WhatsappModule} from "../whatsapp/module/whatsapp.module";

const coreModules = [
    ConfigModule,
    DatabaseModule,
    forwardRef(() => AuthModule),
    forwardRef(() => ClientModule),
    forwardRef(() => MailerModule),
    forwardRef(() => WhatsappModule)
];

@Module({
    imports: [
        ...coreModules,
        HealthCheckModule
    ],
    exports: coreModules,
})
export class SharedModule { }
