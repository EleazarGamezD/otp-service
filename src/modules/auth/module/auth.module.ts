import {Module, forwardRef} from "@nestjs/common";
import {ProjectModule} from "../../projects/module/project.module";
import {SharedModule} from "../../shared/shared.module";
import {ApiKeyService} from "../api-key.service";
import {ApiKeyGuard} from "../guard/api-key.guard";
import {RateLimitMiddleware} from "../middleware/rate-limit.middleware";

@Module({
    imports: [
        forwardRef(() => SharedModule),
        forwardRef(() => ProjectModule)
    ],
    providers: [ApiKeyService, ApiKeyGuard, RateLimitMiddleware],
    exports: [ApiKeyService, ApiKeyGuard, RateLimitMiddleware],
})
export class AuthModule { }