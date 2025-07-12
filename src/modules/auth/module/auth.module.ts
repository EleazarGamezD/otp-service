import {DatabaseModule} from "@app/core/database/module/database.module";
import {Module} from "@nestjs/common";
import {ApiKeyGuard} from "../guard/api-key.guard";
import {RateLimitMiddleware} from "../middleware/rate-limit.middleware";
import {ApiKeyService} from "../service/api-key.service";

@Module({
    imports: [DatabaseModule],
    providers: [ApiKeyService, ApiKeyGuard, RateLimitMiddleware],
    exports: [ApiKeyService, ApiKeyGuard, RateLimitMiddleware],
})
export class AuthModule { }