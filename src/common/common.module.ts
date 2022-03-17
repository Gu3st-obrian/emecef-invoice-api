import { Module } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { CommonService } from './common.service';

@Module({
    providers: [CommonService, GlobalService],
    exports: [CommonService],
})
export class CommonModule {}
