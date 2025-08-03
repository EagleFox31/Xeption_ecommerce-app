import { useMutation, useQuery, useQueryClient } from 'react-query';
import orderApiService, { Order, OrderRequest } from '../services/orderApiService';
import { useAuth } from './useAuth';
import { useCart } from './useCart';

// Order query keys
export const ORDER_KEYS = {
  all: ['orders'] as const,
  lists: () => [...ORDER_KEYS.all, 'list'] as const,
  details: (id: string) => [...ORDER_KEYS.all, 'detail', id] as const,
};

export const useOrder = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();

  // Get user orders
  const {
    data: orders,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery(
    ORDER_KEYS.lists(),
    () => orderApiService.getUserOrders(),
    {
      enabled: isAuthenticated, // Only fetch orders when user is authenticated
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  // Get order by ID
  const getOrder = (orderId: string) => {
    return useQuery(
      ORDER_KEYS.details(orderId),
      () => orderApiService.getOrderById(orderId),
      {
        enabled: !!orderId,
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    );
  };

  // Create order mutation
  const createOrder = useMutation<Order, Error, OrderRequest>(
    (orderData: OrderRequest) => orderApiService.createOrder(orderData),
    {
      onSuccess: (data) => {
        // Invalidate and refetch orders after creating a new order
        queryClient.invalidateQueries(ORDER_KEYS.lists());
        
        // Clear the cart after successful order creation
        clearCart();
      },
    }
  );

  // Checkout mutation (combines order creation and payment processing)
  const checkout = useMutation<Order, Error, OrderRequest>(
    (orderData: OrderRequest) => orderApiService.checkout(orderData),
    {
      onSuccess: (data) => {
        // Invalidate and refetch orders after checkout
        queryClient.invalidateQueries(ORDER_KEYS.lists());
        
        // Clear the cart after successful checkout
        clearCart();
      },
    }
  );

  // Verify payment status
  const verifyPayment = useMutation<any, Error, string>(
    (paymentId: string) => orderApiService.verifyPayment(paymentId),
    {
      onSuccess: (data) => {
        // If payment status has changed, refresh orders
        if (data.status === 'completed') {
          queryClient.invalidateQueries(ORDER_KEYS.lists());
        }
      },
    }
  );

  return {
    // Queries
    orders,
    isLoadingOrders,
    ordersError,
    refetchOrders,
    getOrder,
    
    // Mutations
    createOrder: createOrder.mutate,
    isCreatingOrder: createOrder.isLoading,
    createOrderError: createOrder.error,
    createOrderReset: createOrder.reset,
    
    checkout: checkout.mutate,
    isCheckingOut: checkout.isLoading,
    checkoutError: checkout.error,
    checkoutReset: checkout.reset,
    
    verifyPayment: verifyPayment.mutate,
    isVerifyingPayment: verifyPayment.isLoading,
    verifyPaymentError: verifyPayment.error,
  };
};