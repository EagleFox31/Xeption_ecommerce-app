import { IsString, IsNumber, IsPositive, IsOptional } from "class-validator";

export class CreateCartDto {
  // Cart is automatically created for the authenticated user
}

export class AddCartItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  unitPrice: number;
}

export class UpdateCartItemDto {
  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class RemoveCartItemDto {
  // Item ID is provided in the URL parameter
}
