import { IsString, IsObject, IsOptional, IsEnum } from "class-validator";
import { OrderStatus } from "../../../domain/cartorder/order.entity";

export class ShippingAddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateOrderDto {
  @IsString()
  cartId: string;

  @IsObject()
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  @IsObject()
  billingAddress?: ShippingAddressDto;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
