import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProviderSchema } from './provider.schema';
import { InfoModule } from 'src/v1/info/info.module';
import { ProviderHistoryModule } from 'src/provider-history/provider-history.module';


@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'provider',
                schema: ProviderSchema,
            },
        ]),

        InfoModule,
        
        ProviderHistoryModule,
    ],
    controllers: [ProviderController],
    providers: [ProviderService],
    exports: [ProviderService],
})
export class ProviderModule { }
