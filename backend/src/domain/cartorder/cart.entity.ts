export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  currency: string;
  status: CartStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum CartStatus {
  ACTIVE = "active",
  ABANDONED = "abandoned",
  CONVERTED = "converted",
}

export interface CreateCartRequest {
  userId: string;
}

export interface AddCartItemRequest {
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateCartItemRequest {
  cartId: string;
  itemId: string;
  quantity: number;
}

export interface RemoveCartItemRequest {
  cartId: string;
  itemId: string;
}
