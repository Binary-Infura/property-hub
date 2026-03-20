import { Module } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [VisitsController],
    providers: [VisitsService],
    exports: [VisitsService],
})
export class VisitsModule { }
