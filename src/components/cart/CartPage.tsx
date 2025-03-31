import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

const CartPage = () => {
  // Mock cart data
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "MacBook Pro M2",
      price: 1299.99,
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
      quantity: 1,
      category: "computers",
    },
    {
      id: "2",
      name: "iPhone 15 Pro",
      price: 999.99,
      image:
        "https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&q=80",
      quantity: 1,
      category: "smartphones",
    },
    {
      id: "3",
      name: "AirPods Pro",
      price: 249.99,
      image:
        "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80",
      quantity: 1,
      category: "accessories",
    },
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.19; // 19% VAT
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-black min-h-screen">
      <h1 className="text-3xl font-bold text-gold-500 mb-8">Votre Panier</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-4">
            Votre panier est vide
          </h2>
          <p className="text-gray-400 mb-8">
            Parcourez notre catalogue pour trouver les meilleurs produits tech
          </p>
          <Link to="/products">
            <Button className="bg-gold-500 hover:bg-gold-600 text-black">
              Continuer vos achats
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Articles ({cartItems.length})
              </h2>
              {cartItems.map((item) => (
                <div key={item.id} className="mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-24 h-24 bg-gray-800 rounded-md overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <Link
                          to={`/products/detail/${item.id}`}
                          className="text-white hover:text-gold-500 font-medium"
                        >
                          {item.name}
                        </Link>
                        <span className="text-gold-500 font-semibold">
                          {(item.price * item.quantity).toLocaleString(
                            "fr-FR",
                            {
                              style: "currency",
                              currency: "XAF",
                            },
                          )}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        Catégorie: {item.category}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-gray-700 text-gray-400"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.id,
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className="w-14 h-8 text-center bg-gray-800 border-gray-700 text-white"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-gray-700 text-gray-400"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500 hover:bg-transparent"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator className="mt-6 bg-gray-800" />
                </div>
              ))}
              <div className="flex justify-between mt-6">
                <Link to="/products">
                  <Button
                    variant="outline"
                    className="border-gray-700 text-white"
                  >
                    Continuer vos achats
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Résumé de la commande
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sous-total</span>
                    <span className="text-white">
                      {calculateSubtotal().toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "XAF",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">TVA (19%)</span>
                    <span className="text-white">
                      {calculateTax().toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "XAF",
                      })}
                    </span>
                  </div>
                  <Separator className="my-4 bg-gray-800" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-gold-500">
                      {calculateTotal().toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "XAF",
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 bg-gold-500 hover:bg-gold-600 text-black font-semibold"
                  onClick={() => alert("Checkout functionality coming soon!")}
                >
                  Passer à la caisse
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="mt-6 text-xs text-gray-500">
                  <p>Méthodes de paiement acceptées:</p>
                  <p className="mt-1">Mobile Money, Carte Bancaire, PayPal</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 mt-6">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium text-white mb-2">
                  Besoin d'aide?
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Notre équipe est disponible 24/7 pour vous assister
                </p>
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-white"
                >
                  Contacter le support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
