import { Injectable, Logger } from '@nestjs/common';
import { ICommon } from 'src/common/common.entity';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class InfoService {
    private readonly logger = new Logger(InfoService.name);

    constructor (private readonly utils: CommonService) {}

    public async GetStatus():Promise<ICommon> {
        const response:ICommon = await this.utils.EmecefApi({
            url: '/api/info/status',
            method: 'GET',
        });

        this.logger.debug("v1.info.GetApiStatus.response", response);
        return response;
    }

    public async GetTaxGroups():Promise<ICommon> {
        const response:ICommon = await this.utils.EmecefApi({
            url: '/api/info/taxGroups',
            method: 'GET',
        });

        this.logger.debug("v1.info.GetTaxGroups.response", response);
        return response;
    }

    public async GetInvoiceTypes():Promise<ICommon> {
        const response:ICommon = await this.utils.EmecefApi({
            url: '/api/info/invoiceTypes',
            method: 'GET',
        });

        this.logger.debug("v1.info.GetInvoiceTypes.response", response);
        return response;
    }

    public async GetPaymentTypes():Promise<ICommon> {
        const response:ICommon = await this.utils.EmecefApi({
            url: '/api/info/paymentTypes',
            method: 'GET',
        });

        this.logger.debug("v1.info.GetPaymentTypes.response", response);
        return response;
    }
}
