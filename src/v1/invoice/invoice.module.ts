import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { CommonModule } from 'src/common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceSchema } from './invoice.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'invoice',
                schema: InvoiceSchema,
            },
        ]),

        CommonModule
    ],
    providers: [InvoiceService],
    controllers: [InvoiceController]
})
export class InvoiceModule { }
