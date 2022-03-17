
import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { Response, Request, NextFunction } from 'express';
import { DateTime } from 'luxon';
import { GlobalService } from './global/global.service';
import { ProviderDocument } from './provider/provider.schema';
import { ProviderService } from './provider/provider.service';

@Injectable()
export class AppMiddleware implements NestMiddleware {
    private readonly logger = new Logger();

    constructor(
        private readonly configService: ConfigService,
        private readonly providerService: ProviderService,
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {

        /**
         * Read request headers.
         */
        const appRequestTimestamp = req.headers['x-app-request-timestamp'] as string;

        // Extract app name and signature.
        const extraction = String(req.headers['x-app-signature']).split('=');
        const appName = extraction[0];
        const appSignature = extraction[1];

        // Account Id related to this API. (Optional)
        const providerKey = req.headers['x-provider-key'] as string;

        /**
         * End of reading request headers.
         */

        

        // Check required headers before continue.
        if (!appName || !appRequestTimestamp || !appSignature) {
            return res.status(HttpStatus.PRECONDITION_REQUIRED).send({
                statusCode: HttpStatus.PRECONDITION_REQUIRED,
                reason: "MISSING_HEADERS",
            });
        }



        /**
         * Verifying timestamp of the request.
         */

        if (!this.absolute_time(appRequestTimestamp)) {
            return res.status(HttpStatus.UNAUTHORIZED).send({
                statusCode: HttpStatus.UNAUTHORIZED,
                reason: "HACKER_DETECTED",
            });
        }

        /**
         * End of verifying timestamp of the request.
         */



        /**
         * Verifying request signature.
         */

        if (appName.length == 0) {
            return res.status(HttpStatus.PRECONDITION_FAILED).send({
                statusCode: HttpStatus.PRECONDITION_FAILED,
                reason: "APPLICATION_NOT_FOUND",
            });
        }


        // Parse request body.
        const bodyParser = JSON.stringify(req.body);

        const SigBasestring = `${appName}:${appRequestTimestamp}:${bodyParser}`;

        // Get secret.
        let appSecret = "";
        const appKeys = this.configService.get<string>('app.allowed').split('|');

        // Extract secret key if founded.
        for (const app of appKeys) {
            const a = app.split(':');
            if (a.length == 2 && a[0] == appName) {
                appSecret = a[1];
                break;
            }
        }

        // Not secret key found for this app name.
        if (appSecret.length == 0) {
            return res.status(HttpStatus.PRECONDITION_FAILED).send({
                statusCode: HttpStatus.PRECONDITION_FAILED,
                reason: "APPLICATION_KEY_NOT_FOUND",
            });
        }

        // Generate signature.
        const reqSignature = createHmac('sha256', appSecret)
            .update(SigBasestring)
            .digest('hex');

        // Compare signature.
        if (reqSignature != appSignature) {
            return res.status(HttpStatus.EXPECTATION_FAILED).send({
                statusCode: HttpStatus.EXPECTATION_FAILED,
                reason: "SIGNATURE_EXPECTATION_FAILED",
            });
        }

        /**
         * End verifying request signature.
         */



        /**
         * Setup global variable.
         */

        // User requests with provider key.
        if (providerKey && providerKey.length > 0) {

            // Set application name who make the request in the global var.
            GlobalService.appName = appName;

            // Verify key in the store.
            const provider: ProviderDocument = await this.providerService.findOneBy({
                pid: providerKey
            });

            if (!provider) {
                return res.status(HttpStatus.UNAUTHORIZED).send({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    reason: "PROVIDER_KEY_NOT_FOUND",
                });
            }

            // Application who registered the provider must match.
            if (provider.application != appName) {
                return res.status(HttpStatus.UNAUTHORIZED).send({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    reason: "PROVIDER_NOT_IN_APPLICATION",
                });
            }

            // Set provider info.
            GlobalService.provider = provider;

            // Make difference between default token and request provider token.
            GlobalService.hasProvider = true;
        }
        else {
            // Set default application name.
            GlobalService.appName = this.configService.get<string>('emecef.userName');

            // Set default token for remote api request call like tax groups.
            GlobalService.provider = {
                token: this.configService.get<string>('emecef.userToken'),
                ifu: this.configService.get<string>('emecef.userIFU'),
                pid: this.configService.get<string>('emecef.userPID'),
            } as ProviderDocument;

            // Make difference between default token and request provider token.
            GlobalService.hasProvider = false;


            /**
             * For unexpected reason, the file configuration.ts
             * don't have a valid emecef default config value.
             */
            if (
                !GlobalService.appName ||
                GlobalService.appName.length === 0 ||
                !GlobalService.provider.token ||
                GlobalService.provider.token.length === 0
            ) {
                return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    reason: "Bad configuration found for emecef default value. Please contact the developer of the API !",
                });
            }
        }

        /**
         * End of global variable setup.
         */


        next();
    }

    absolute_time(value: string) {
        try {
            // Check timestamp of the request.
            const currentTimestamp = DateTime.local().toMillis();

            // Convert timestamp to number.
            const requestTimestamp = parseInt(value);

            // Get default timestamp delay.
            const delay = this.configService.get<number>('request.timestampDelay');

            /**
             * If the request timestamp is more than [five] minutes from local time
             * it could be a replay attack, so let's ignore it.
             */
            return !((currentTimestamp - requestTimestamp) > delay);
        } catch (error) {
            this.logger.log("absolute_time.error", error);
            return false;
        }
    }
}
