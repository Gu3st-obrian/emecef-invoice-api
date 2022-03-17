import { Injectable, Logger } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { ICommon } from 'src/common/common.entity';
import { InvoiceCompletionDto } from './invoice.entity';
import { Invoice, InvoiceDocument } from './invoice.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class InvoiceService {
    private readonly logger = new Logger(InvoiceService.name);

    constructor (
        @InjectModel('invoice') 
        private readonly model: Model<InvoiceDocument>,
        private readonly utils: CommonService,
    ) {}

    public async createOne(payload:Invoice) {
        try {
            return await this.model.create(payload);
        } catch (error) {
            this.logger.error("v1.invoice.db.createOne.error", error);
            return null;
        }
    }

    public async findOne(queries: any):Promise<InvoiceDocument | null> {
        return await this.model.findOne(queries).exec();
    }

    public async find(queries:any):Promise<InvoiceDocument[] | []> {
        return await this.model.find(queries).exec();
    }

    public async updateOne(id:string, data:any) {
        return await this.model.updateOne({ uid: id }, data).exec();
    }

    
    public async GetApiStatus():Promise<ICommon> {
        const response:ICommon = await this.utils.EmecefApi({
            url: '/api/invoice',
            method: 'GET',
        });

        this.logger.debug("v1.invoice.GetApiStatus.response", response);
        return response;
    }


    public async GetOneInvoiceStatus(invoiceId:string):Promise<ICommon> {
        const response:ICommon = await this.utils.EmecefApi({
            url: `/api/invoice/${invoiceId}`,
            method: 'GET',
        });

        this.logger.debug("v1.invoice.GetApiStatus.response", response);
        return response;
    }


    public async CompleteInvoice(payload:InvoiceCompletionDto):Promise<ICommon> {
        const response:ICommon = await this.utils.EmecefApi({
            url: `/api/invoice/${payload.invoiceId}/${payload.action}`,
            method: 'PUT',
        });

        this.logger.debug("v1.invoice.CompleteInvoice.response", response);
        return response;
    }


    public async AddPendingInvoice(payload:Invoice):Promise<ICommon> {
        const response:ICommon = await this.utils.EmecefApi({
            url: '/api/invoice',
            method: 'POST',
            data: payload
        });

        this.logger.debug("v1.invoice.AddPendingInvoice.response", response);
        return response;
    }
}
