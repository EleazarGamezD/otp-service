import {Project, ProjectSchema} from '@app/core/database/schemas/projects/project.schema';
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AdminProjectController} from '../controller/admin-project.controller';
import {ProjectController} from '../controller/project.controller';
import {ProjectService} from '../service/project.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Project.name, schema: ProjectSchema}
        ]),
    ],
    providers: [ProjectService],
    controllers: [ProjectController, AdminProjectController],
    exports: [ProjectService, MongooseModule],
})
export class ProjectModule { }
