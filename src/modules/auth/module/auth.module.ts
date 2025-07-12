import {Module} from "@nestjs/common";
import {ApiKeyService} from "../service/api-key.service";

@Module({
    imports: [],
    controllers: [],
    providers: [ApiKeyService],
    exports: [ApiKeyService]
})
export class AuthModule { }