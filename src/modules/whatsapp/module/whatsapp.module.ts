import {Module} from "@nestjs/common";
import {WhatsappService} from "../service/whatsapp.service";

@Module({
    imports: [],
    controllers: [],
    exports: [WhatsappService],
    providers: [WhatsappService]
})
export class WhatsappModule { }