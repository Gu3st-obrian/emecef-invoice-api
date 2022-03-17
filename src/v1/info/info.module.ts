import { Module } from '@nestjs/common';
import { InfoService } from './info.service';
import { InfoController } from './info.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
    imports: [CommonModule],
    providers: [InfoService],
    exports: [InfoService],
    controllers: [InfoController]
})
export class InfoModule { }
