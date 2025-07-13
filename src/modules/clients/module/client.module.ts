import {Module, forwardRef} from '@nestjs/common';
import {SharedModule} from '../../shared/shared.module';
import {ClientController} from '../controller/client.controller';
import {ClientService} from '../service/client.service';

@Module({
    imports: [forwardRef(() => SharedModule)],
    controllers: [ClientController],
    providers: [ClientService],
    exports: [ClientService],
})
export class ClientModule { }
