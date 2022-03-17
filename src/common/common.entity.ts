import { HttpStatus } from "@nestjs/common";

export interface ICommon {
    statusCode: HttpStatus;
    reason?: string;
    values?: any;
};

export interface ISMSData {
    body:string;
    contacts:Array<ISMSContact>
};

interface ISMSContact {
    msisdn: string;
    country_code: string;
};

export interface IEmailData {
    object?: string;
    contacts: Array<IEmail>;
    body: string;
};

interface IEmail {
    email: string;
};
