import {Module} from "@nestjs/common";
import {MailTestController} from "../controller/mail-test.controller";
import {MailService} from "../service/mail.service";

@Module({
    imports: [],
    controllers: [MailTestController],
    providers: [MailService],
    exports: [MailService],
})
export class MailerModule { }