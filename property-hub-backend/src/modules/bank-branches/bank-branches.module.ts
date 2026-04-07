import { Module } from '@nestjs/common';
import { BankBranchesService } from './bank-branches.service';
import { BankBranchesController } from './bank-branches.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [BankBranchesController],
    providers: [BankBranchesService],
    exports: [BankBranchesService]
})
export class BankBranchesModule { }
