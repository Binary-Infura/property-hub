import { Module, forwardRef } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { BuyersController } from './buyers.controller';
import { PrismaService } from '../../../database/prisma.service';
import { UsersModule } from '../../users/users.module';

import { PublicBuyersController } from './public-buyers.controller';

@Module({
    imports: [forwardRef(() => UsersModule)],
    controllers: [BuyersController, PublicBuyersController],
    providers: [BuyersService, PrismaService],
    exports: [BuyersService],
})
export class BuyersModule { }
