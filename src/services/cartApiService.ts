import apiClient from './api-client';
import { Product } from './catalogService';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  subtotal: number;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export const cartApiService = {
  // Get current user's cart
  getCurrentCart: async (): Promise<Cart> => {
    const response = await apiClient.get<{success: boolean, data: Cart}>('/api/cartorder/cart');
    return response.data.data;
  },
  
  // Get cart by ID (useful for guest carts)
  getCartById: async (cartId: string): Promise<Cart> => {
    const response = await apiClient.get<{success: boolean, data: Cart}>(`/api/cartorder/cart/${cartId}`);
    return response.data.data;
  },
  
  // Create a new cart
  createCart: async (): Promise<Cart> => {
    const response = await apiClient.post<{success: boolean, data: Cart}>('/api/cartorder/cart');
    return response.data.data;
  },
  
  // Add item to cart
  addToCart: async (item: AddToCartRequest, cartId?: string): Promise<Cart> => {
    // If cartId is provided, add to that specific cart
    if (cartId) {
      const response = await apiClient.post<{success: boolean, data: Cart}>(
        `/api/cartorder/cart/${cartId}/items`, 
        item
      );
      return response.data.data;
    }
    
    // Otherwise add to current user's cart or create a new one
    const response = await apiClient.post<{success: boolean, data: Cart}>(
      '/api/cartorder/cart/items', 
      item
    );
    return response.data.data;
  },
  
  // Update cart item quantity
  updateCartItemQuantity: async (
    cartId: string,
    itemId: string,
    request: UpdateCartItemRequest
  ): Promise<Cart> => {
    const response = await apiClient.put<{success: boolean, data: Cart}>(
      `/api/cartorder/cart/${cartId}/items/${itemId}`,
      request
    );
    return response.data.data;
  },
  
  // Remove item from cart
  removeFromCart: async (cartId: string, itemId: string): Promise<Cart> => {
    const response = await apiClient.delete<{success: boolean, data: Cart}>(
      `/api/cartorder/cart/${cartId}/items/${itemId}`
    );
    return response.data.data;
  },
  
  // Clear cart (remove all items)
  clearCart: async (cartId: string): Promise<void> => {
    await apiClient.delete<{success: boolean}>(`/api/cartorder/cart/${cartId}/clear`);
  },
  
  // Delete cart completely
  deleteCart: async (cartId: string): Promise<void> => {
    await apiClient.delete<{success: boolean}>(`/api/cartorder/cart/${cartId}`);
  },
  
  // Merge guest cart with user cart on login
  mergeCart: async (guestCartId: string): Promise<Cart> => {
    // This is a hypothetical endpoint - adjust based on actual API
    const response = await apiClient.post<{success: boolean, data: Cart}>(
      `/api/cartorder/cart/merge`,
      { guestCartId }
    );
    return response.data.data;
  },
  
  // Proceed to checkout
  checkout: async (cartId: string, checkoutData: any): Promise<any> => {
    const response = await apiClient.post('/api/cartorder/checkout', {
      cartId,
      ...checkoutData
    });
    return response.data;
  }
};

export default cartApiService;