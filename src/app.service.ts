import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { CommonService } from './common/common.service';
import { Provider } from './provider/provider.schema';
import { ProviderService } from './provider/provider.service';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    constructor(
        private readonly providerService: ProviderService,
        private readonly commonService: CommonService,
        private readonly configService: ConfigService,
    ) {}

    // Start Every Day.
    public async VerifyTokenValidity() {

        // Send email to relevant user.
        const allProviders = await this.providerService.findManyBy({
            isActive: true,
        });

        allProviders.forEach(async (provider:Provider) => {

            // Verify Token validity time.
            const tokenTime = DateTime.fromISO(provider.tokenExpiry).minus({
                days: this.configService.get<number>("emecef.tokenWeeklyReminder"),
            });
            const todayTime = DateTime.now();

            // TODO: Remove log after test..
            this.logger.log("VerifyTokenValidity.tokenTime", tokenTime);
            this.logger.log("VerifyTokenValidity.todayTime", todayTime);

            // Compare date.
            if (todayTime >= tokenTime) {
                
                // Send mail reminder.
                if (provider.email) {
                    await this.commonService.SendMail({
                        body: this.constructMessage(true),
                        contacts: [
                            { email: provider.email }
                        ],
                    });
                }

                // Send SMS reminder.
                if (provider.phoneNumber && provider.notifyLimit) {
                    await this.commonService.SendSMS({
                        body: this.constructMessage(false),
                        contacts: [
                            { 
                                country_code: "229", 
                                msisdn: provider.phoneNumber.slice(-8) 
                            }
                        ],
                    });

                    // Reduce notify limit.
                    // provider.notifyLimit -= 1;
                    await this.providerService.updateOne({
                        pid: provider.pid,
                    }, {
                        notifyLimit: --provider.notifyLimit,
                    });
                }

                if (provider.notifyLimit == 0) {
                    const result = await this.providerService.updateOne({
                        pid: provider.pid
                    }, {
                        isActive: false
                    });
                    this.logger.debug("ProviderController.DeleteOneProvider.result", result);
                }
            }
        });
    }

    private constructMessage(isMail: boolean): string {
        // TODO: Setup template for mail reminder.
        return `Votre token expire dans ${this.configService.get<number>("emecef.tokenWeeklyReminder")} jours.`;
    }
}
