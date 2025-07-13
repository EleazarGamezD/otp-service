import {Module, forwardRef} from "@nestjs/common";
import {SharedModule} from "../../shared/shared.module";
import {MailTestController} from "../controller/mail-test.controller";
import {MailService} from "../service/mail.service";

@Module({
    imports: [forwardRef(() => SharedModule)],
    controllers: [MailTestController],
    providers: [MailService],
    exports: [MailService],
})
export class MailerModule { }