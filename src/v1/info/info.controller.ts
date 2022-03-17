import { Controller, Get, HttpStatus, Logger, Res } from '@nestjs/common';
import { TaxGroupsName } from './info.entity';
import { InfoService } from './info.service';
import { Response } from 'express';
import { ICommon } from 'src/common/common.entity';

@Controller("v1/info")
export class InfoController {
    private readonly logger = new Logger(InfoController.name);

    constructor(
        private readonly service: InfoService,
    ) { }

    @Get("api/status")
    public async GetApiStatusInfo(@Res() response: Response) {

        try {
            // Call service to verify status.
            const result:ICommon = await this.service.GetStatus();
            //
            return response.status(result.statusCode).send(result);

        } catch (error) {
            this.logger.error("v1.info.GetApiStatusInfo.error", error);
            //
            return response.status(HttpStatus.SERVICE_UNAVAILABLE).send({
                statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                reason: "UNEXPECTED_ERROR_OCCURED",
            });
        }
    }

    @Get("payment-types")
    public async GetApiPaymentTypesInfo(@Res() response: Response) {

        try {
            // Call service to verify status.
            const result:ICommon = await this.service.GetPaymentTypes();
            //
            return response.status(result.statusCode).send(result);

        } catch (error) {
            this.logger.error("v1.info.GetApiPaymentTypesInfo.error", error);
            //
            return response.status(HttpStatus.SERVICE_UNAVAILABLE).send({
                statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                reason: "UNEXPECTED_ERROR_OCCURED",
            });
        }
    }

    @Get("invoice-types")
    public async GetApiInvoiceTypesInfo(@Res() response: Response) {

        try {
            // Call service to verify status.
            const result:ICommon = await this.service.GetInvoiceTypes();
            //
            return response.status(result.statusCode).send(result);

        } catch (error) {
            this.logger.error("v1.info.GetApiInvoiceTypesInfo.error", error);
            //
            return response.status(HttpStatus.SERVICE_UNAVAILABLE).send({
                statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                reason: "UNEXPECTED_ERROR_OCCURED",
            });
        }
    }

    @Get("tax-groups")
    public async GetApiTaxGroupsInfo(@Res() response: Response) {

        try {
            // Call service to verify status.
            const result:ICommon = await this.service.GetTaxGroups();

            const values = {
                tax: [],
                aib: [],
            };

            if (result.statusCode == HttpStatus.OK) {
                // Construct.
                Object.keys(result.values).forEach((key:string) => {
                    if (key.startsWith('aib')) {
                        values.aib.push({
                            key: key.replace('aib', ''),
                            value: TaxGroupsName[key] || result.values[key],
                        });
                    }
                    else {
                        values.tax.push({
                            key: key,
                            value: TaxGroupsName[key] || result.values[key],
                        });
                    }
                });

                return response.status(result.statusCode).send({
                    statusCode: result.statusCode,
                    values: values,
                });
            }

            // If API call return error.
            return response.status(result.statusCode).send(result);

        } catch (error) {
            this.logger.error("v1.info.GetApiTaxGroupsInfo.error", error);
            //
            return response.status(HttpStatus.SERVICE_UNAVAILABLE).send({
                statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                reason: "UNEXPECTED_ERROR_OCCURED",
            });
        }
    }
}
