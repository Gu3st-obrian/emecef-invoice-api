import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Document, Schema as Sch } from 'mongoose';
import { InvoiceTypeEnum, TaxAIBEnum, TaxGroupEnum } from 'src/v1/invoice/invoice.entity';

export interface IProvider {
    application?: string;
    token?: string;
    hasToken?: boolean;
    isDev?: boolean;
    pid?: string;
    ifu?: string;
    nim?: string;
    tokenExpiry?: string;
    aib?: string;
    taxGroup?: TaxGroupEnum;
    invoiceType?: InvoiceTypeEnum;
    isActive?: boolean;
    additionalInfo?: any;
    email?: string;
    phoneNumber?: string;
    notifyLimit?: number;
}

@Schema({
    toJSON: { versionKey: false },
    timestamps: true,
})
export class Provider implements IProvider {

    // OPENSI application name who registered this provider.
    @IsOptional()
    @IsString()
    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    application: string;


    // e-MeCeF token to access their API.
    @IsString()
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
    @IsOptional()
    @IsBoolean()
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


    // `Identifiant Fiscal Unique`
    @IsOptional()
    @IsString()
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
    @IsOptional()
    @IsEnum(TaxAIBEnum, {
        message: `aib must be in (${Object.values(TaxAIBEnum).join(',')})`
    })
    @Prop({
        type: Sch.Types.String,
        default: TaxAIBEnum.N,
    })
    aib?: TaxAIBEnum;


    // Optional. Default tax applicable to item.
    @IsOptional()
    @IsEnum(TaxGroupEnum, {
        message: `taxGroup must be in (${Object.values(TaxGroupEnum).join(',')})`
    })
    @Prop({
        type: Sch.Types.String,
        default: TaxGroupEnum.B,
    })
    taxGroup: TaxGroupEnum;


    // Optional. Invoice type to use by default if none received.
    @IsOptional()
    @IsEnum(InvoiceTypeEnum, {
        message: `invoiceType must be in (${Object.values(InvoiceTypeEnum).join(',')})`
    })
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
    @IsOptional()
    @Prop({
        type: Sch.Types.Mixed,
        default: null,
    })
    additionalInfo?: any;


    // Email who receive alert.
    @IsOptional()
    @IsString()
    @Prop({
        type: Sch.Types.String,
        required: false,
    })
    email?: string;


    // Phone number who receive alert. Number of SMS limited by `notifyLimit`
    @IsOptional()
    @IsString()
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

export type ProviderDocument = Provider & Document;

export const ProviderSchema = SchemaFactory.createForClass(Provider);
