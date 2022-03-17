import * as dotenv from 'dotenv';
import * as path from 'path';

const parse = dotenv.config({
    path: path.join(__dirname, "..", "..", ".env"),
});
if (!parse.error) {
    process.env = { ...process.env, ...parse.parsed };
}

const configuration = {
    local: {
        http: {
            port: parseInt(process.env.HTTP_PORT) || 3000,
        },

        app: {
            database: process.env.DATABASE_URL || "mongodb://127.0.0.1:27018/emecef_dgi",
            allowed: process.env.ALLOWED_APPS || "app_1:d21a10bd27519666489c69b503|app_2:c39b9ad189dd8316235a7b4a8d2",
        },

        request: {
            timestampDelay: parseInt(process.env.REQUEST_TIMESTAMP_DELAY) || 60 * 5 * 1000,
            invoiceTsExpiry: parseInt(process.env.INVOICE_EXPIRY_TS) || 60 * 4 * 1000,
        },

        emecef: {
            baseUrl: process.env.EMECEF_BASEURL || "https://developper.impots.bj/sygmef-emcf",
            userToken: process.env.EMECEF_USER_TOKEN || "",
            userIFU: process.env.EMECEF_USER_IFU || "",
            userPID: process.env.EMECEF_USER_PID || "",
            userName: process.env.EMECEF_USER_NAME || "",
            tokenWeeklyReminder: parseInt(process.env.EMECEF_TOKEN_REMINDER) || 7,
        },

        bomboo: {
            apiKey: process.env.BOMBOO_APIKEY || "",
            emailUrl: process.env.BOMBOO_MAIL_URL || "",
            smsUrl: process.env.BOMBOO_SMS_URL || "",
        },
    },
    
    development: {
        http: {
            port: parseInt(process.env.HTTP_PORT) || 3000,
        },

        app: {
            database: process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/emecef_dgi",
            allowed: process.env.ALLOWED_APPS || "",
        },

        request: {
            timestampDelay: parseInt(process.env.REQUEST_TIMESTAMP_DELAY) || 300000, // 60 * 5 * 1000,
            invoiceTsExpiry: parseInt(process.env.INVOICE_EXPIRY_TS) || 60 * 4 * 1000,
        },

        emecef: {
            baseUrl: process.env.EMECEF_BASEURL || "https://developper.impots.bj/sygmef-emcf",
            userToken: process.env.EMECEF_USER_TOKEN || "",
            userIFU: process.env.EMECEF_USER_IFU || "",
            userPID: process.env.EMECEF_USER_PID || "",
            userName: process.env.EMECEF_USER_NAME || "",
            tokenWeeklyReminder: parseInt(process.env.EMECEF_TOKEN_REMINDER) || 7,
        },

        bomboo: {
            apiKey: process.env.BOMBOO_APIKEY || "",
            emailUrl: process.env.BOMBOO_MAIL_URL || "",
            smsUrl: process.env.BOMBOO_SMS_URL || "",
        },
    },
    
    production: {
        http: {
            port: parseInt(process.env.HTTP_PORT) || 3000,
        },

        app: {
            database: process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/emecef_dgi",
            allowed: process.env.ALLOWED_APPS || "",
        },

        request: {
            timestampDelay: parseInt(process.env.REQUEST_TIMESTAMP_DELAY) || 300000, // 60 * 5 * 1000,
            invoiceTsExpiry: parseInt(process.env.INVOICE_EXPIRY_TS) || 60 * 4 * 1000,
        },

        emecef: {
            baseUrl: process.env.EMECEF_BASEURL || "https://sygmef.impots.bj/emcf",
            userToken: process.env.EMECEF_USER_TOKEN || "",
            userIFU: process.env.EMECEF_USER_IFU || "",
            userPID: process.env.EMECEF_USER_PID || "",
            userName: process.env.EMECEF_USER_NAME || "",
            tokenWeeklyReminder: parseInt(process.env.EMECEF_TOKEN_REMINDER) || 7,
        },

        bomboo: {
            apiKey: process.env.BOMBOO_APIKEY || "",
            emailUrl: process.env.BOMBOO_MAIL_URL || "",
            smsUrl: process.env.BOMBOO_SMS_URL || "",
        },
    },
};

export default () => (configuration[process.env.NODE_ENV]);
