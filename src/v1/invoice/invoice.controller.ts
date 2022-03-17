import { Body, Controller, Get, HttpStatus, Logger, Param, Post, Put, Res, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { DateTime } from 'luxon';
import * as _ from 'lodash';

import { ICommon } from 'src/common/common.entity';
import { GlobalService } from 'src/global/global.service';
import { InvoiceActionEnum, InvoiceCompletionDto, TaxAIBEnum, TransactionInvoiceData } from './invoice.entity';
import { Invoice } from './invoice.schema';
import { InvoiceService } from './invoice.service';

@Controller("v1/invoice")
export class InvoiceController {
    private readonly logger = new Logger(InvoiceController.name);

    constructor(
        private readonly service: InvoiceService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * @description Check e-MECEF Invoice API status.
     */
    @Get("api/status")
    public async VerifyAPI(@Res() response: Response): Promise<ICommon> {
        const result: ICommon = await this.service.GetApiStatus();
        return response.status(result.statusCode).send(result);
    }

    /**
     * @description Get amounts calculated by e-MCF for submitted invoice
     * @param invoiceId string Unique identifier of one invoice
     */
    @Get("remote/info/:invoiceId")
    public async VerifyPendingInvoice(
        @Res() response: Response,
        @Param("invoiceId") invoiceId: string
    ): Promise<ICommon> {
        const result: ICommon = await this.service.GetOneInvoiceStatus(invoiceId);
        return response.status(result.statusCode).send(result);
    }

    /**
     * @description Read invoice details from database
     * @param invoiceId string Unique identifier of one invoice
     */
    @Get("local/info/:invoiceId")
    public async ReadInvoice(
        @Res() response: Response,
        @Param("invoiceId") invoiceId: string
    ): Promise<ICommon> {
        const result = await this.service.findOne({ uid: invoiceId });

        // No invoice found.
        if (!result) {
            return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                reason: "INVOICE_NOT_FOUND",
            });
        }

        // Download only confirmed invoice.
        if (result.status !== InvoiceActionEnum.CONFIRM) {
            return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                reason: "INVOICE_NOT_CONFIRMED",
            });
        }

        // remove unecessary data.
        const data = _.omit(
            JSON.parse(JSON.stringify(result)),
            ['_id', 'id', 'providerKey']
        );

        return response.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            values: data,
        });
    }

    @Post("transaction/fetch/data")
    public async ReadMixteTransactionInvoice(
        @Res() response: Response,
        @Body(ValidationPipe) payload: TransactionInvoiceData,
    ): Promise<ICommon> {
        const result = await this.service.findOne({
            transactionId: payload.transactionId,
            isDefaultToken: payload.isFee,
        });

        // No invoice found.
        if (!result) {
            return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                reason: "INVOICE_NOT_FOUND",
            });
        }

        // Download only confirmed invoice.
        if (result.status !== InvoiceActionEnum.CONFIRM) {
            return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                reason: "INVOICE_NOT_CONFIRMED",
            });
        }

        // remove unecessary data.
        const data = _.omit(
            JSON.parse(JSON.stringify(result)),
            ['_id', 'id', 'providerKey']
        );

        return response.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            values: data,
        });
    }

    /**
     * @param payload Invoice request
     */
    @Post("declare")
    public async AddPendingInvoice(
        @Res() response: Response,
        @Body(ValidationPipe) payload: Invoice
    ): Promise<ICommon> {
        try {
            this.logger.log("v1.invoice.AddPendingInvoice.payload", payload);

            /**
             * Transaction invoices history verification.
             * ==========================================
             * Avoid processing same transaction.
             * Allow transaction if invoice has a cancel status
             * Allow transaction if invoice has a pending status since a less 2 minutes
             * Auto cancel pending invoice with more than 2 minutes
             * Deny transaction if one invoice has confirm status
             */

            // Retrieve invoice expiry delay. (2 mins by default)
            const tsDelay = this.configService.get<number>('request.invoiceTsExpiry');

            // Get current date.
            const currentDate = DateTime.local().toMillis();

            const useDefaultToken = (GlobalService.provider.pid === this.configService.get('emecef.userPID'));

            // Make sure that transaction not already declared.
            const invoices = await this.service.find({
                transactionId: payload.transactionId,
                isDefaultToken: useDefaultToken,
            });

            for (const invoice of invoices) {

                // Don't process confirmed transction invoice.
                if (invoice.status == InvoiceActionEnum.CONFIRM) {
                    return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                        reason: "TRANSACTION_ALREADY_CONFIRMED",
                    });
                }

                // Verify pending invoice delay first.
                if (invoice.status == InvoiceActionEnum.PENDING) {

                    // Transaction still waiting confirmation.
                    if ((currentDate - invoice.createdAt) < tsDelay) {
                        return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                            reason: "TRANSACTION_WAITING_CONFIRMATION",
                        });
                    } else {
                        /**
                         * Cancel pending transaction with outfit delay.
                         * If you want, you can call remote emecef api to get
                         * corresponding action response. But this answer, don't really
                         * matter cause of delay of two minutes speficying in their doc.
                         */
                        await this.service.updateOne(invoice.id, {
                            status: InvoiceActionEnum.CANCEL,
                            actionResponse: "Timeout !",
                        });
                    }
                }
            }

            /**
             * End of transaction invoices history verification.
             */


            // Get provider IFU.
            payload.ifu = GlobalService.provider.ifu;


            // Set associated provider key used to make the request.
            payload.providerKey = GlobalService.provider.pid;


            /**
             * Working on AIB value.
             */

            if (!payload.aib && GlobalService.provider.aib != TaxAIBEnum.N) {
                // Set AIB with default value if not defined.
                payload.aib = GlobalService.provider.aib;
            }
            else if (payload.aib && payload.aib == TaxAIBEnum.N) {
                // Remove AIB if not applicable.
                delete payload.aib;
            }

            /**
             * End of work on AIB value.
             */


            // Set facture type.
            if (!payload.type) {
                payload.type = GlobalService.provider.invoiceType;
            }


            // Set tax with default value if not defined in the request.
            for (let i = 0; i < payload.items.length; i++) {
                //
                if (!payload.items[i].taxGroup) {
                    payload.items[i].taxGroup = GlobalService.provider.taxGroup;
                }
            }


            // Send invoice request to remote emecef API.
            const data = _.omit(payload, ['providerKey', 'transactionId']);
            const result: ICommon = await this.service.AddPendingInvoice(data);

            if (result.statusCode === HttpStatus.OK) {

                /**
                 * Something going bad during invoice declaration.
                 * ===============================================
                 * For some case, you can receive a 200 HTTP status,
                 * but the invoice declaration would be rejected.
                 * According to their doc, make sure that uid was defined.
                 */
                if (!result.values.uid) {
                    return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                        reason: result.values.errorDesc
                    });
                }


                /**
                 * Save remote api response for further debugging help.
                 */

                // Set vendor response
                payload.pendingResponse = JSON.stringify(result.values);

                // Set invoice Id.
                payload.uid = result.values.uid;

                // Define if we use default app token.
                payload.isDefaultToken = useDefaultToken;

                // Persist data into BD.
                await this.service.createOne(payload);
            }

            return response.status(result.statusCode).send(result);

        } catch (error) {
            this.logger.error("v1.invoice.AddPendingInvoice.error", error);
            //
            const status = error.statusCode || HttpStatus.SERVICE_UNAVAILABLE;
            return response.status(status).send({
                statusCode: status,
                reason: "UNEXPECTED_ERROR_OCCURED",
            });
        }
    }

    /**
     * @description confirm or cancel pending invoice 
     * @param action string 
     */
    @Put("complete")
    public async InvoiceCompletion(
        @Res() response: Response,
        @Body(ValidationPipe) payload: InvoiceCompletionDto
    ): Promise<ICommon> {
        try {
            this.logger.log("v1.invoice.InvoiceCompletion.payload", payload);

            /**
             * TODO: Test and remove. Never happen. 
             * Require a valid invoice action for completion.
             */
            if (!Object.values(InvoiceActionEnum).includes(payload.action)) {
                return response.status(HttpStatus.BAD_REQUEST).send({
                    statusCode: HttpStatus.BAD_REQUEST,
                    reason: "INVALID_ACTION_VALUE",
                });
            }

            /**
             * Not allow pending action.
             * Even if validation pipe, check value, don't forget that
             * `InvoiceActionEnum` also contain pending value that is not allowed
             * on remote emecef api completion request.
             */
            if (payload.action == InvoiceActionEnum.PENDING) {
                return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    reason: "ALREADY_PENDING_STATE",
                });
            }

            //
            const useDefaultToken = (GlobalService.provider.pid === this.configService.get('emecef.userPID'));

            // Get invoice details.
            const invoice = await this.service.findOne({
                id: payload.invoiceId,
                isDefaultToken: useDefaultToken,
            });

            if (!invoice) {
                return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    reason: "INVOICE_NOT_FOUND",
                });
            }

            // Send action request.
            const result: ICommon = await this.service.CompleteInvoice(payload);

            if (result.statusCode === HttpStatus.OK) {

                /**
                 * Persist API response in database.
                 * =================================
                 * After validation of an invoice, the GET resource with uid failed.
                 * That means that, they are no way to get information from a completed
                 * declaration invoice.
                 * Also if invoice pending status reach two minutes (In their docs).
                 */
                await this.service.updateOne(payload.invoiceId, {
                    actionResponse: JSON.stringify(result.values),
                    status: payload.action,
                });

                /**
                 * Something going bad during validation.
                 * errorCode can be defined an contains anything.
                 */
                if (
                    result.values.errorCode ||
                    (
                        typeof result.values.errorCode == 'string' &&
                        result.values.errorCode.length > 0
                    )
                ) {
                    return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                        reason: "NOT_FOUND_OR_ALREADY_PROCESSED",
                    });
                }

                // result.values = _.merge(result.values, { uid: payload.invoiceId });
            }

            return response.status(result.statusCode).send(result);

        } catch (error) {
            this.logger.error("v1.invoice.InvoiceCompletion.error", error);
            return response.status(HttpStatus.SERVICE_UNAVAILABLE).send({
                statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                reason: "UNEXPECTED_ERROR_OCCURED",
            });
        }
    }
}
