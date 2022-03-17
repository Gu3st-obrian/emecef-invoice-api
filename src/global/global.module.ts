import { Module } from '@nestjs/common';
import { GlobalService } from './global.service';

export const AliasGlobalProvider = {
    provide: 'GLOBAL',
    useExisting: GlobalService,
};

@Module({
    providers: [GlobalService, AliasGlobalProvider],
    exports: [GlobalService, AliasGlobalProvider],
})
export class GlobalModule {}
