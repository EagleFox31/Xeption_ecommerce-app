import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LocationContext } from "@/context/LocationContext";
import { ShoppingBag, Trash2 } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartPage() {
  // Sample cart items
  const cartItems: CartItem[] = [
    {
      id: "1",
      name: "MacBook Pro M2",
      price: 1299000,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    },
    {
      id: "2",
      name: "iPhone 15 Pro",
      price: 599000,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&q=80",
    },
    {
      id: "3",
      name: "AirPods Pro",
      price: 129000,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80",
    },
  ];

  const { selectedLocation, calculateDeliveryCost } =
    useContext(LocationContext);
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const deliveryCost = calculateDeliveryCost(subtotal);
  const total = subtotal + deliveryCost;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
    }).format(price);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gold-500">
          Your Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.length > 0 ? (
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
                          >
                            -
                          </Button>
                          <span className="mx-3">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-gray-700"
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
                        >
                          <Trash2 className="h-5 w-5" />
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
                <Button className="bg-gold-500 hover:bg-gold-600 text-black">
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
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Delivery to {selectedLocation || "Yaoundé"}
                    </span>
                    <span className="text-white">
                      {formatPrice(deliveryCost)}
                    </span>
                  </div>
                  <Separator className="bg-gray-800 my-4" />
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-gold-500">{formatPrice(total)}</span>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-gold-500 hover:bg-gold-600 text-black font-bold">
                  Proceed to Checkout
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
