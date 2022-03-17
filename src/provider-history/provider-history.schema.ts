import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as Sch } from 'mongoose';
import { IProvider } from 'src/provider/provider.schema';
import { InvoiceTypeEnum, TaxAIBEnum, TaxGroupEnum } from 'src/v1/invoice/invoice.entity';

@Schema({
    collection: "providerhistorys",
    toJSON: { versionKey: false },
    timestamps: true,
})
export class ProviderHistory implements IProvider {

    // OPENSI application name allowed to use this module.
    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    application: string;


    // e-MeCeF token to access their API.
    @Prop({
        type: Sch.Types.String,
        default: "",
    })
    token: string;


    // Avoid sending real token value.
    @Prop({
        type: Sch.Types.Boolean,
        default: true,
    })
    hasToken?: boolean;


    // Specify if the token if for dev.
    @Prop({
        type: Sch.Types.Boolean,
        default: true,
    })
    isDev?: boolean;


    // Unique Id to identify the account who use the module.
    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    pid?: string;


    // Identifiant Fiscal Unique
    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    ifu: string;


    // Auto-filled with e-MeCeF API call.
    @Prop({
        type: Sch.Types.String,
        default: "",
    })
    nim: string;


    // Auto-filled with e-MeCeF API call. Informs about the token expiration date.
    @Prop({
        type: Sch.Types.Date,
        required: true,
    })
    tokenExpiry: string;


    // Optional. Invoice type to use by default if none received.
    @Prop({
        type: Sch.Types.String,
        default: TaxAIBEnum.N,
    })
    aib?: TaxAIBEnum;


    // Optional. Default tax applicable to item.
    @Prop({
        type: Sch.Types.String,
        default: TaxGroupEnum.B,
    })
    taxGroup: TaxGroupEnum;


    // Optional. Invoice type to use by default if none received.
    @Prop({
        type: Sch.Types.String,
        default: InvoiceTypeEnum.FV,
    })
    invoiceType: InvoiceTypeEnum;


    // Define if the token can be used.
    @Prop({
        type: Sch.Types.Boolean,
        default: true,
    })
    isActive?: boolean;


    // Relevant for each application.
    @Prop({
        type: Sch.Types.Mixed,
        default: null,
    })
    additionalInfo?: any;


    // Email who receive alert.
    @Prop({
        type: Sch.Types.String,
        required: false,
    })
    email?: string;


    // Phone number who receive alert. Number of SMS limited by `notifyLimit`
    @Prop({
        type: Sch.Types.String,
        required: false,
    })
    phoneNumber?: string;


    // Auto-filled. Limit SMS notification.
    @Prop({
        type: Sch.Types.Number,
        default: 4,
    })
    notifyLimit?: number;
}

export type ProviderHistoryDocument = ProviderHistory & Document;

export const ProviderHistorySchema = SchemaFactory.createForClass(ProviderHistory);
