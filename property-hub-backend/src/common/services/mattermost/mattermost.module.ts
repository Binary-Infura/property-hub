import { Module, Global } from '@nestjs/common';
import { MattermostService } from './mattermost.service';

@Global()
@Module({
    providers: [MattermostService],
    exports: [MattermostService],
})
export class MattermostModule { }
