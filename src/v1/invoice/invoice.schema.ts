import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { Document, Schema as Sch } from 'mongoose';
import { ClientEntity, InvoiceActionEnum, InvoiceTypeEnum, ItemEntity, OperatorEntity, PaymentEntity, TaxAIBEnum } from './invoice.entity';

@Schema({
    toJSON: { versionKey: false },
    timestamps: true,
})
export class Invoice {
    
    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    providerKey?: string;

    
    // Transaction associated to this invoice.
    @IsString({
        message: "Missing `transactionId` related to transaction to declare."
    })
    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    transactionId?: string;

    
    // IFU du vendeur.
    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    ifu?: string;
    

    // A = 1 && B = 5
    @IsOptional()
    @IsEnum(TaxAIBEnum, {
        message: `aib must be in (${Object.values(TaxAIBEnum).join(',')})`
    })
    @Prop({
        type: Sch.Types.String,
        default: ""
    })
    aib?: TaxAIBEnum;
    

    @IsOptional()
    @IsEnum(InvoiceTypeEnum, {
        message: `type must be in (${Object.values(InvoiceTypeEnum).join(',')})`
    })
    @Prop({
        type: Sch.Types.String,
        default: InvoiceTypeEnum.FV, // Facture de Vente.
    })
    type?: InvoiceTypeEnum;


    @IsArray()
    @ArrayMinSize(1)
    @Type(() => ItemEntity)
    @Prop({
        type: Sch.Types.Array,
        required: true,
    })
    items: Array<ItemEntity>;


    @IsOptional()
    @Type(() => ClientEntity)
    @Prop({
        type: Sch.Types.Mixed,
        default: {},
    })
    client?: ClientEntity;


    @IsObject()
    @Type(() => OperatorEntity)
    @Prop({
        type: Sch.Types.Mixed,
        required: true,
    })
    operator: OperatorEntity;


    @IsArray()
    @ArrayMinSize(1)
    @Type(() => PaymentEntity)
    @Prop({
        type: Sch.Types.Array,
        required: true,
    })
    payment: Array<PaymentEntity>;

    
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Prop({
        type: Sch.Types.String,
        default: ""
    })
    reference?: string;


    @Prop({
        type: Sch.Types.String,
        unique: true,
        // required: true,
    })
    uid?: string;


    @Prop({
        type: Sch.Types.String,
        required: true,
        default: InvoiceActionEnum.PENDING,
    })
    status?: InvoiceActionEnum;


    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    pendingResponse?: string;


    @Prop({
        type: Sch.Types.String,
        default: "",
    })
    actionResponse?: string;


    @Prop()
    createdAt: number;


    // Define if request has gone with app config token set.
    @Prop({
        type: Sch.Types.Boolean,
        default: false,
    })
    isDefaultToken?: boolean;
}

export type InvoiceDocument = Invoice & Document;

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
