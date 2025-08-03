import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { LocationContext } from "@/context/LocationContext";
import { ShoppingBag, Trash2, Tag, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { CartItem } from "@/services/cartApiService";

export default function CartPage() {
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  
  const { isAuthenticated } = useAuth();
  const {
    cart,
    isLoading,
    error,
    updateItemQuantity,
    removeItem,
    isUpdatingItem,
    isRemovingItem
  } = useCart();

  const { userLocation, calculateDeliveryCost } = useContext(LocationContext);
  
  // Use cart data from our API integration
  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const deliveryCost = calculateDeliveryCost(subtotal);
  const total = subtotal + deliveryCost - discount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
    }).format(price);
  };

  // Handle quantity changes
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    updateItemQuantity({ itemId, quantity: newQuantity });
  };

  // Handle item removal
  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  // Apply promo code
  const handleApplyPromoCode = () => {
    setPromoError("");

    // Mock promo codes for demonstration
    const promoCodes = {
      WELCOME10: { discount: 0.1, minOrder: 50000 },
      XEPTION20: { discount: 0.2, minOrder: 100000 },
      FREESHIP: { discount: deliveryCost, minOrder: 0 },
    };

    const promoInfo = promoCodes[promoCode as keyof typeof promoCodes];

    if (!promoInfo) {
      setPromoError("Code promotionnel invalide");
      setDiscount(0);
      return;
    }

    if (subtotal < promoInfo.minOrder) {
      setPromoError(
        `Ce code nécessite une commande minimale de ${formatPrice(promoInfo.minOrder)}`,
      );
      setDiscount(0);
      return;
    }

    // Calculate discount
    const discountAmount =
      promoInfo.discount >= 1
        ? promoInfo.discount // Fixed amount
        : Math.round(subtotal * promoInfo.discount); // Percentage

    setDiscount(discountAmount);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gold-500">
          Your Shopping Cart
          {!isAuthenticated && (
            <span className="text-sm font-normal text-gray-400 block mt-2">
              Connectez-vous pour sauvegarder votre panier
            </span>
          )}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="text-center py-12 bg-gray-900 rounded-lg">
                <Loader2 className="h-16 w-16 mx-auto text-gold-500 mb-4 animate-spin" />
                <h2 className="text-2xl font-medium text-white mb-2">
                  Loading your cart...
                </h2>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-gray-900 rounded-lg">
                <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                <h2 className="text-2xl font-medium text-white mb-2">
                  Failed to load cart
                </h2>
                <p className="text-gray-400 mb-6">
                  There was an error loading your cart. Please try again.
                </p>
                <Button
                  variant="outline"
                  className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black"
                  onClick={() => navigate("/")}
                >
                  Return to Homepage
                </Button>
              </div>
            ) : cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="bg-gray-900 border-gray-800">
                    <div className="p-4 flex items-center">
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <h3 className="text-lg font-medium text-white">
                          {item.name}
                        </h3>
                        <p className="text-gold-500 font-semibold">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-gray-700"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            disabled={isUpdatingItem || isRemovingItem}
                          >
                            -
                          </Button>
                          <span className="mx-3">
                            {isUpdatingItem ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-gray-700"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            disabled={isUpdatingItem || isRemovingItem}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 mt-2"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isRemovingItem || isUpdatingItem}
                        >
                          {isRemovingItem ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <h2 className="text-2xl font-medium text-white mb-2">
                  Your cart is empty
                </h2>
                <p className="text-gray-400 mb-6">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <Button
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                  onClick={() => navigate("/")}
                >
                  Continue Shopping
                </Button>
              </div>
            )}
          </div>

          <div>
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-white">
                  Order Summary
                </h2>

                {/* Promo Code Section */}
                <div className="mb-4">
                  <div className="flex space-x-2 mb-2">
                    <Input
                      placeholder="Code promotionnel"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyPromoCode}
                      className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black"
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Appliquer
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-red-400 text-sm">{promoError}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Delivery to {userLocation}
                    </span>
                    <span className="text-white">
                      {formatPrice(deliveryCost)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Réduction</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <Separator className="bg-gray-800 my-4" />
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-gold-500">{formatPrice(total)}</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 bg-gold-500 hover:bg-gold-600 text-black font-bold"
                  onClick={() =>
                    navigate("/checkout", {
                      state: {
                        cartId: cart?.id,
                        discount,
                        promoCode: discount > 0 ? promoCode : null,
                      },
                    })
                  }
                  disabled={!cart || cartItems.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
