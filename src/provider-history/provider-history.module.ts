import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProviderHistorySchema } from './provider-history.schema';
import { ProviderHistoryService } from './provider-history.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'provider-history',
                schema: ProviderHistorySchema,
            },
        ]),
    ],
    providers: [ProviderHistoryService],
    exports: [ProviderHistoryService],
})
export class ProviderHistoryModule { }
