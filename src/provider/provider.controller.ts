import { Body, Controller, Get, HttpStatus, Logger, Post, Put, Res, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { DateTime } from "luxon";
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';

import { ICommon } from 'src/common/common.entity';
import { InfoService } from 'src/v1/info/info.service';
import { Provider, ProviderDocument } from './provider.schema';
import { ProviderService } from './provider.service';
import { GlobalService } from 'src/global/global.service';
import { ProviderHistoryService } from 'src/provider-history/provider-history.service';
import { ProviderHistory, ProviderHistoryDocument } from 'src/provider-history/provider-history.schema';

@Controller("provider")
export class ProviderController {
    private readonly logger = new Logger(ProviderController.name);

    constructor(
        private readonly service: ProviderService,
        private readonly historyService: ProviderHistoryService,
        private readonly infoService: InfoService,
        private readonly configService: ConfigService,
    ) { }


    @Get()
    public async GetOneProvider(@Res() response: Response) {

        // Never print token value.
        const data = _.pick(GlobalService.provider, [
            'pid', 'nim', 'ifu', 'aib',
            'taxGroup', 'invoiceType',
            'email', 'phoneNumber',
            'tokenExpiry', 'createdAt',
            'isActive', 'hasToken', 'isDev',
        ]);

        // Return no private data.
        return response.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            values: data,
        });
    }


    @Put("toggle/status")
    public async UpdateProviderStatus(@Res() response: Response) {

        // Must have token before using this resource.
        if (!GlobalService.provider.hasToken) {
            return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                reason: "MUST_HAVE_TOKEN_FIRST",
            });
        }

        // Toggle provider status.
        const result = await this.service.updateOne(
            { pid: GlobalService.provider.pid },
            { isActive: !GlobalService.provider.isActive }
        );
        this.logger.debug("ProviderController.UpdateProviderStatus.result", result);

        if (result.modifiedCount == 0) {
            return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                reason: "MODIFICATION_FAILED",
            });
        }

        return response.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            values: { isActive: !GlobalService.provider.isActive }
        });
    }


    @Post()
    public async CreateOneProvider(
        @Res() response: Response,
        @Body(ValidationPipe) payload: Provider,
    ) {
        // Log request inputs.
        this.logger.log("CreateOneProvider.inputs", payload);

        /**
         * Verify app key name before processing the request.
         */
        let foundAppKey = false;
        const appKeys = this.configService.get<string>('app.allowed').split('|');

        // Try to find app name in the allowed apps.
        for (const app of appKeys) {
            const a = app.split(':');
            if (a.length == 2 && a[0] == payload.application) {
                foundAppKey = true;
                break;
            }
        }

        if (!foundAppKey) {
            return response.status(HttpStatus.UNAUTHORIZED).send({
                statusCode: HttpStatus.UNAUTHORIZED,
                reason: "APPLICATION_UNAUTHORIZED",
            });
        }

        /**
         * End of verification.
         */


        // Set default value.
        payload.tokenExpiry = DateTime.now().toISO();
        payload.isActive = false;
        payload.hasToken = false;


        /**
         * In some cases, no token received.
         */
        if (payload.token && payload.token.length > 0) {

            // Set provider token for verification status.
            GlobalService.provider = { token: payload.token } as ProviderDocument;

            // Verify api status first.
            const health: ICommon = await this.infoService.GetStatus();
            if (health.statusCode != HttpStatus.OK) {
                return response.status(health.statusCode).send({
                    ...health,
                    reason: "INVALID_TOKEN_CREDENTIALS",
                });
            }

            /**
             * Verify Token validity time.
             * Compare token date with server date
             * to stay in the same local date time.
             */
            const tokenValidTime = DateTime.fromISO(health.values.tokenValid);
            const serverDateTime = DateTime.fromISO(health.values.serverDateTime);

            // 
            this.logger.log("CreateOneProvider.tokenValidTime", tokenValidTime);
            this.logger.log("CreateOneProvider.serverDateTime", serverDateTime);

            // Compare date
            if (tokenValidTime < serverDateTime) {
                return response.status(HttpStatus.NOT_ACCEPTABLE).send({
                    statusCode: HttpStatus.NOT_ACCEPTABLE,
                    reason: "TOKEN_INVALID_TIME",
                });
            }

            /**
             * End of verification.
             */

            // Set provider IFU.
            payload.ifu = health.values.ifu;

            // Set provider NIM.
            payload.nim = health.values.nim;

            // Set token validity.
            payload.tokenExpiry = health.values.tokenValid;

            //
            payload.isActive = true;

            //
            payload.hasToken = true;
        }


        /**
         * Provider Schema contains a unique value of IFU.
         * So, if token change, we need to move old config to history.
         * Why? Because, in the future, we wanna know which token was used to
         * declare related invoices.
         */

        // Get current provider info.
        let history: ProviderHistoryDocument = await this.service.findOneBy({
            application: payload.application,
            ifu: payload.ifu,
        });
        this.logger.log("CreateOneProvider.history.findOne", history?._id);

        // One config found, so we move it if token set.
        if (history) {
            if (history.token) {

                const newData: ProviderHistory = _.pick(history, [
                    'pid', 'nim', 'ifu', 'aib',
                    'taxGroup', 'invoiceType',
                    'email', 'phoneNumber',
                    'token', 'tokenExpiry', 'hasToken',
                    'isDev', 'isActive', 'application',
                    'additionalInfo', 'notifyLimit',
                ]);

                // Add provider info to history.
                history = await this.historyService.createOne(newData);
            }

            // Remove provider from it schemes.
            await this.service.deleteOne(history._id);
        }

        // Generate new provider Id.
        payload.pid = uuidv4();

        // Save new configuration.
        const result = await this.service.createOne(payload);
        this.logger.log("CreateOneProvider.result", result?._id);
        //
        if (!result) {
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                reason: "DATA_SAVING_FAILED",
            });
        }

        // Return new provider key and expiry date 
        return response.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            values: {
                providerKey: payload.pid,
                isActive: payload.isActive,
                tokenExpiry: payload.tokenExpiry,
            }
        });
    }
}
