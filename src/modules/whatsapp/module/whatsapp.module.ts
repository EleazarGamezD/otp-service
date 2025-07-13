import {Module, forwardRef} from "@nestjs/common";
import {SharedModule} from "../../shared/shared.module";
import {WhatsappService} from "../service/whatsapp.service";

@Module({
    imports: [forwardRef(() => SharedModule)],
    controllers: [],
    exports: [WhatsappService],
    providers: [WhatsappService]
})
export class WhatsappModule { }