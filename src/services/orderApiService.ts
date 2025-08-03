import apiClient from './api-client';
import { Cart } from './cartApiService';

export interface DeliveryAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
}

export interface DeliveryMethod {
  type: 'standard' | 'express' | 'pickup';
  cost: number;
  estimatedDeliveryDays: string;
}

export interface PaymentMethod {
  type: 'card' | 'mobile' | 'cash';
  details?: {
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    mobileNumber?: string;
  };
}

export interface OrderRequest {
  cartId: string;
  deliveryAddress: DeliveryAddress;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  customerNotes?: string;
  transactionId?: string;
}

export interface Order {
  id: string;
  customerId?: string;
  items: any[];
  subtotal: number;
  tax: number;
  deliveryCost: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  deliveryMethod: string;
  deliveryAddress: DeliveryAddress;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export const orderApiService = {
  // Create a new order
  createOrder: async (orderData: OrderRequest): Promise<Order> => {
    const response = await apiClient.post<{success: boolean, data: Order}>(
      '/api/cartorder/orders',
      orderData
    );
    return response.data.data;
  },
  
  // Get order by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get<{success: boolean, data: Order}>(
      `/api/cartorder/orders/${orderId}`
    );
    return response.data.data;
  },
  
  // Get all orders for current user
  getUserOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<{success: boolean, data: Order[]}>(
      '/api/cartorder/orders'
    );
    return response.data.data;
  },
  
  // Process checkout
  checkout: async (checkoutData: OrderRequest): Promise<Order> => {
    const response = await apiClient.post<{success: boolean, data: Order}>(
      '/api/cartorder/checkout',
      checkoutData
    );
    return response.data.data;
  },
  
  // Process payment for an order
  processPayment: async (orderId: string, paymentData: any): Promise<any> => {
    const response = await apiClient.post<{success: boolean, data: any}>(
      `/api/cartorder/orders/${orderId}/payments`,
      paymentData
    );
    return response.data.data;
  },
  
  // Verify payment status
  verifyPayment: async (paymentId: string): Promise<any> => {
    const response = await apiClient.get<{success: boolean, data: any}>(
      `/api/cartorder/payments/${paymentId}`
    );
    return response.data.data;
  }
};

export default orderApiService;