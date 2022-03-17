import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import { GlobalService } from 'src/global/global.service';
import { ICommon, IEmailData, ISMSData } from './common.entity';

@Injectable()
export class CommonService {
    private readonly logger = new Logger(CommonService.name);

    constructor (
        private readonly configService: ConfigService,
    ) {}

    /**
     * 
     * @param payload AxiosRequestConfig HTTP request details.
     * @param kkiapay boolean Will use KKIAPAY credentials.
     * @returns 
     */
    public async EmecefApi(payload:AxiosRequestConfig):Promise<ICommon> {
        const response:ICommon = {
            statusCode: HttpStatus.OK,
        };

        // Token not found.
        if (!GlobalService.provider.token) {
            response.statusCode = HttpStatus.PRECONDITION_FAILED,
            response.reason = "USER_TOKEN_NOT_FOUND";
        }
        else {
            const requests = {
                baseURL: this.configService.get('emecef.baseUrl'),
                headers: {
                    Authorization: `Bearer ${GlobalService.provider.token}`,
                },
                ...payload,
            };
    
            this.logger.debug("EmecefApi.requests", JSON.stringify(requests));
    
            await axios.request(requests).then(r => {
                if (r.data) {
                    this.logger.log("EmecefApi.data", JSON.stringify(r.data));
                    response.values = r.data;
                }
            }).catch(e => {
                this.logger.error("EmecefApi.error", e);
                response.statusCode = (e.response && e.response.status) ? e.response.status : HttpStatus.UNPROCESSABLE_ENTITY;
                response.reason = (e.response) ? e.response.data : e.message || ""
            });
        }

        return response;
    }

    public async SendSMS(payload: ISMSData): Promise<any> {

        this.logger.debug("SendSMS.payload", JSON.stringify(payload));

        const response = await axios.request({
            url: this.configService.get<string>('bomboo.smsUrl'),
            method: 'POST',
            data: payload,
            headers: {
                api_key: this.configService.get<string>('bomboo.apiKey'),
            },
        }).then(r => {
            if (r.data) {
                this.logger.verbose("SendSMS.success", JSON.stringify(r.data));
                return r.data;
            }
        }).catch(e => {
            this.logger.error("SendSMS.error", e);
            return null;
        });

        return response ? { ...response, payload } : response;
    }

    public async SendMail(data: IEmailData) {

        const payload = {
            ...data,
            contacts: JSON.stringify(data.contacts),
        };

        //
        const response = await axios.request({
            url: this.configService.get<string>('bomboo.mailUrl'),
            method: 'POST',
            data: payload,
            headers: {
                api_key: this.configService.get<string>('bomboo.apiKey'),
            },
        }).then(r => {
            if (r.data) {
                this.logger.verbose("SendMail.success", r.data);
                return r.data;
            }
        }).catch(e => {
            if (e.response && e.response.data) {
                this.logger.error("SendMail.error", e.response.data);
            }
            else if (e.request) {
                this.logger.error("SendMail.error", e);
            }
            return null;
        });

        return response ? { ...response, payload } : response;
    }
}
