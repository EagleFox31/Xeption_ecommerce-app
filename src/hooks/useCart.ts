import { useMutation, useQuery, useQueryClient } from 'react-query';
import cartApiService, { 
  Cart, 
  CartItem, 
  AddToCartRequest, 
  UpdateCartItemRequest 
} from '../services/cartApiService';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

const CART_ID_KEY = 'guest_cart_id';

// Cart query keys
export const CART_KEYS = {
  all: ['cart'] as const,
  current: () => [...CART_KEYS.all, 'current'] as const,
  detail: (id: string) => [...CART_KEYS.all, 'detail', id] as const,
};

export const useCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [cartId, setCartId] = useState<string | null>(localStorage.getItem(CART_ID_KEY));
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to ensure we have a valid cart ID
  const ensureCartId = async (): Promise<string> => {
    // If we're authenticated, we'll use the user's cart, so we don't need to create a new one
    if (isAuthenticated) {
      try {
        const cart = await cartApiService.getCurrentCart();
        return cart.id;
      } catch (error) {
        console.error('Failed to get current cart:', error);
        const newCart = await cartApiService.createCart();
        return newCart.id;
      }
    }

    // For guest users, check if we have a cart ID in localStorage
    let storedCartId = localStorage.getItem(CART_ID_KEY);
    
    // If no cart ID exists, create a new cart
    if (!storedCartId) {
      try {
        const newCart = await cartApiService.createCart();
        localStorage.setItem(CART_ID_KEY, newCart.id);
        setCartId(newCart.id);
        return newCart.id;
      } catch (error) {
        console.error('Failed to create new cart:', error);
        throw error;
      }
    }
    
    return storedCartId;
  };

  // Initialize cart if needed
  useEffect(() => {
    if (!isInitialized) {
      ensureCartId()
        .then(() => setIsInitialized(true))
        .catch(error => console.error('Failed to initialize cart:', error));
    }
  }, [isInitialized, isAuthenticated]);

  // When a user logs in, merge their guest cart with their user cart
  useEffect(() => {
    if (isAuthenticated && cartId && user) {
      cartApiService.mergeCart(cartId)
        .then(() => {
          // After merging, clear the guest cart ID
          localStorage.removeItem(CART_ID_KEY);
          setCartId(null);
          // Refetch the user's cart to get the merged data
          queryClient.invalidateQueries(CART_KEYS.current());
        })
        .catch(error => console.error('Failed to merge carts:', error));
    }
  }, [isAuthenticated, cartId, user, queryClient]);

  // Query for the current cart
  const { data: cart, isLoading, error, refetch } = useQuery<Cart>(
    CART_KEYS.current(),
    async () => {
      const id = await ensureCartId();
      return isAuthenticated
        ? cartApiService.getCurrentCart()
        : cartApiService.getCartById(id);
    },
    {
      enabled: isInitialized,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  // Mutation to add item to cart
  const addToCart = useMutation(
    async ({ productId, quantity }: AddToCartRequest) => {
      const id = await ensureCartId();
      return cartApiService.addToCart({ productId, quantity }, id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CART_KEYS.current());
      },
    }
  );

  // Mutation to update item quantity
  const updateItemQuantity = useMutation(
    async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const id = await ensureCartId();
      return cartApiService.updateCartItemQuantity(id, itemId, { quantity });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CART_KEYS.current());
      },
    }
  );

  // Mutation to remove item from cart
  const removeItem = useMutation(
    async (itemId: string) => {
      const id = await ensureCartId();
      return cartApiService.removeFromCart(id, itemId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CART_KEYS.current());
      },
    }
  );

  // Mutation to clear cart
  const clearCart = useMutation(
    async () => {
      const id = await ensureCartId();
      return cartApiService.clearCart(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CART_KEYS.current());
      },
    }
  );

  return {
    cart,
    isLoading,
    error,
    addToCart: addToCart.mutate,
    updateItemQuantity: updateItemQuantity.mutate,
    removeItem: removeItem.mutate,
    clearCart: clearCart.mutate,
    refetch,
    isAddingToCart: addToCart.isLoading,
    isUpdatingItem: updateItemQuantity.isLoading,
    isRemovingItem: removeItem.isLoading,
    isClearingCart: clearCart.isLoading,
  };
};