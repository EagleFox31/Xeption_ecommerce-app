import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsObject,
} from "class-validator";
import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
} from "../../../domain/cartorder/payment.entity";

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(PaymentProvider)
  paymentProvider: PaymentProvider;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ProcessPaymentDto {
  @IsString()
  transactionId: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsOptional()
  @IsString()
  failureReason?: string;
}
