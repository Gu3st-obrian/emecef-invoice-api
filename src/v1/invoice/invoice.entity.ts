import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export enum InvoiceActionEnum {
    CONFIRM = "confirm",
    CANCEL = "cancel",
    PENDING = "pending",
};

export class InvoiceCompletionDto {
    @IsString({
        message: 'require uid invoice Id received during declaration'
    })
    invoiceId: string;

    @IsEnum(InvoiceActionEnum, {
        message: `action must be in (confirm, cancel)`
    })
    action: InvoiceActionEnum;
};

export enum TaxAIBEnum {
    A = "A",
    B = "B",
    N = "N/A", // Not applicable.
};

export enum TaxGroupEnum {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F"
}

export enum InvoiceTypeEnum {
    FV = "FV",
    EV = "EV",
    FA = "FA",
    EA = "EA",
};

export class PaymentEntity {

    @IsString()
    name: string; // ESPECES

    @IsNumber()
    amount: number;
};

export class OperatorEntity {

    @IsString()
    id?: string;

    @IsString()
    name: string;
};

export class ClientEntity {

    @IsOptional()
    @IsString()
    ifu: string;

    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    contact: string;

    @IsOptional()
    @IsString()
    address: string;
};

export class ItemEntity {

    @IsOptional()
    @IsString()
    code?: string;

    @IsString()
    name: string;

    @IsNumber()
    price: number;

    @IsNumber()
    quantity: number;

    @IsString()
    taxGroup: string;

    @IsOptional()
    @IsNumber()
    taxSpecific?: number;

    @IsOptional()
    @IsNumber()
    originalPrice?: number;

    @IsOptional()
    @IsString()
    priceModification?: string;
};


export class TransactionInvoiceData { 
    @IsString()
    transactionId: string; 

    @IsBoolean()
    isFee: boolean; 
};
