import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [UploadsController],
})
export class UploadsModule { }
