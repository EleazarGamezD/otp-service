import {Module, forwardRef} from "@nestjs/common";
import {SharedModule} from "../../shared/shared.module";
import {ApiKeyGuard} from "../guard/api-key.guard";
import {RateLimitMiddleware} from "../middleware/rate-limit.middleware";
import {ApiKeyService} from "../service/api-key.service";

@Module({
    imports: [forwardRef(() => SharedModule)],
    providers: [ApiKeyService, ApiKeyGuard, RateLimitMiddleware],
    exports: [ApiKeyService, ApiKeyGuard, RateLimitMiddleware],
})
export class AuthModule { }