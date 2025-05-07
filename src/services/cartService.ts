import { getCurrentUser } from "./auth";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Key for storing cart in localStorage
const CART_STORAGE_KEY = "xeption_cart";

// Get user-specific cart key
const getUserCartKey = (userId: string) => `${CART_STORAGE_KEY}_${userId}`;

// Save cart to localStorage
export const saveCart = (items: CartItem[]): void => {
  try {
    const user = getCurrentUser();
    const storageKey = user ? getUserCartKey(user.id) : CART_STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving cart:", error);
  }
};

// Load cart from localStorage
export const loadCart = (): CartItem[] => {
  try {
    const user = getCurrentUser();
    const storageKey = user ? getUserCartKey(user.id) : CART_STORAGE_KEY;
    const cartData = localStorage.getItem(storageKey);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error("Error loading cart:", error);
    return [];
  }
};

// Add item to cart
export const addToCart = (item: CartItem): CartItem[] => {
  const cart = loadCart();
  const existingItemIndex = cart.findIndex((i) => i.id === item.id);

  if (existingItemIndex >= 0) {
    // Update quantity if item already exists
    cart[existingItemIndex].quantity += item.quantity;
  } else {
    // Add new item
    cart.push(item);
  }

  saveCart(cart);
  return cart;
};

// Update item quantity
export const updateCartItemQuantity = (
  itemId: string,
  quantity: number,
): CartItem[] => {
  const cart = loadCart();
  const itemIndex = cart.findIndex((i) => i.id === itemId);

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart[itemIndex].quantity = quantity;
    }
    saveCart(cart);
  }

  return cart;
};

// Remove item from cart
export const removeFromCart = (itemId: string): CartItem[] => {
  const cart = loadCart();
  const updatedCart = cart.filter((item) => item.id !== itemId);
  saveCart(updatedCart);
  return updatedCart;
};

// Clear cart
export const clearCart = (): void => {
  const user = getCurrentUser();
  const storageKey = user ? getUserCartKey(user.id) : CART_STORAGE_KEY;
  localStorage.removeItem(storageKey);
};

// Merge guest cart with user cart on login
export const mergeCartsOnLogin = (userId: string): void => {
  try {
    // Get guest cart
    const guestCart = JSON.parse(
      localStorage.getItem(CART_STORAGE_KEY) || "[]",
    );

    if (guestCart.length === 0) return;

    // Get user cart
    const userCartKey = getUserCartKey(userId);
    const userCart = JSON.parse(localStorage.getItem(userCartKey) || "[]");

    // Merge carts
    const mergedCart = [...userCart];

    guestCart.forEach((guestItem: CartItem) => {
      const existingItemIndex = mergedCart.findIndex(
        (item) => item.id === guestItem.id,
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists in both carts
        mergedCart[existingItemIndex].quantity += guestItem.quantity;
      } else {
        // Add new item from guest cart
        mergedCart.push(guestItem);
      }
    });

    // Save merged cart to user's cart
    localStorage.setItem(userCartKey, JSON.stringify(mergedCart));

    // Clear guest cart
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Error merging carts:", error);
  }
};
