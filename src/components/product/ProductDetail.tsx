import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLocation } from "@/context/LocationContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Star,
  ShoppingCart,
  Heart,
  ChevronLeft,
  Truck,
  Shield,
  RefreshCw,
  Plus,
  Minus,
  Clock,
  CheckCircle,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

// Mock data for products (same as in ProductListing)
const mockProducts = [
  {
    id: "prod-1",
    name: "MacBook Pro M2",
    price: 1200000,
    originalPrice: 1350000,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    rating: 4.5,
    category: "Computers",
    isNew: true,
    isFeatured: true,
    description:
      "Le tout nouveau MacBook Pro avec la puce M2 offre des performances exceptionnelles et une autonomie de batterie incroyable. Parfait pour les professionnels et les créateurs de contenu.",
    specs: [
      "Puce Apple M2",
      "16 Go de RAM",
      "512 Go SSD",
      "Écran Retina 14 pouces",
      "Touch Bar et Touch ID",
      "Autonomie jusqu'à 20 heures",
    ],
    stock: 15,
    relatedProducts: ["prod-5", "prod-2"],
    outOfStockOrders: [],
  },
  {
    id: "prod-2",
    name: "iPhone 14 Pro Max",
    price: 750000,
    originalPrice: 800000,
    image:
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=500&q=80",
    rating: 4.8,
    category: "Smartphones",
    isNew: true,
    isFeatured: false,
    description:
      "L'iPhone 14 Pro Max est le smartphone le plus avancé d'Apple avec un appareil photo professionnel, un écran Super Retina XDR et la puce A16 Bionic.",
    specs: [
      "Puce A16 Bionic",
      "6 Go de RAM",
      "256 Go de stockage",
      "Écran Super Retina XDR 6,7 pouces",
      "Système de caméra pro 48MP",
      "Autonomie toute la journée",
    ],
    stock: 8,
    relatedProducts: ["prod-6", "prod-7"],
    outOfStockOrders: [],
  },
  {
    id: "prod-3",
    name: "Sony WH-1000XM4",
    price: 180000,
    originalPrice: 220000,
    image:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80",
    rating: 4.7,
    category: "Accessories",
    isNew: false,
    isFeatured: true,
    description:
      "Les écouteurs Sony WH-1000XM4 offrent une réduction de bruit de premier ordre, un son de haute qualité et une autonomie de batterie longue durée.",
    specs: [
      "Réduction de bruit active",
      "Autonomie de 30 heures",
      "Connexion Bluetooth multipoint",
      "Commandes tactiles",
      "Compatible avec l'assistant vocal",
      "Pliable pour un transport facile",
    ],
    stock: 20,
    relatedProducts: ["prod-7", "prod-8"],
    outOfStockOrders: [],
  },
  {
    id: "prod-4",
    name: "HP LaserJet Pro",
    price: 350000,
    originalPrice: 380000,
    image:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80",
    rating: 4.2,
    category: "Consumables",
    isNew: false,
    isFeatured: false,
    description:
      "L'imprimante HP LaserJet Pro offre une impression rapide et de haute qualité pour les petites entreprises et les bureaux à domicile.",
    specs: [
      "Vitesse d'impression jusqu'à 30 ppm",
      "Connectivité Wi-Fi et Ethernet",
      "Impression recto-verso automatique",
      "Écran tactile couleur",
      "Capacité de 250 feuilles",
      "Compatible avec HP Smart App",
    ],
    stock: 5,
    relatedProducts: ["prod-8", "prod-5"],
    outOfStockOrders: [],
  },
  {
    id: "prod-5",
    name: "Dell XPS 15",
    price: 980000,
    originalPrice: 1050000,
    image:
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500&q=80",
    rating: 4.6,
    category: "Computers",
    isNew: false,
    isFeatured: true,
    description:
      "Le Dell XPS 15 est un ordinateur portable puissant avec un écran InfinityEdge, des performances exceptionnelles et une construction de qualité supérieure.",
    specs: [
      "Processeur Intel Core i7",
      "16 Go de RAM",
      "1 To SSD",
      "Écran 4K UHD+ 15,6 pouces",
      "Carte graphique NVIDIA GeForce RTX",
      "Autonomie jusqu'à 12 heures",
    ],
    stock: 7,
    relatedProducts: ["prod-1", "prod-4"],
    outOfStockOrders: [],
  },
  {
    id: "prod-6",
    name: "Samsung Galaxy S23",
    price: 650000,
    originalPrice: 700000,
    image:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80",
    rating: 4.4,
    category: "Smartphones",
    isNew: true,
    isFeatured: false,
    description:
      "Le Samsung Galaxy S23 offre une expérience mobile exceptionnelle avec un appareil photo avancé, un écran Dynamic AMOLED et une performance puissante.",
    specs: [
      "Processeur Snapdragon 8 Gen 2",
      "8 Go de RAM",
      "256 Go de stockage",
      "Écran Dynamic AMOLED 6,1 pouces",
      "Triple caméra arrière 50MP",
      "Batterie 3900mAh",
    ],
    stock: 12,
    relatedProducts: ["prod-2", "prod-7"],
    outOfStockOrders: [],
  },
  {
    id: "prod-7",
    name: "Apple AirPods Pro",
    price: 150000,
    originalPrice: 180000,
    image:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80",
    rating: 4.9,
    category: "Accessories",
    isNew: false,
    isFeatured: true,
    description:
      "Les AirPods Pro offrent une réduction active du bruit, un son immersif et un ajustement confortable pour une expérience d'écoute exceptionnelle.",
    specs: [
      "Réduction active du bruit",
      "Mode Transparence",
      "Audio spatial",
      "Résistant à l'eau et à la transpiration",
      "Jusqu'à 4,5 heures d'écoute",
      "Boîtier de charge sans fil",
    ],
    stock: 25,
    relatedProducts: ["prod-3", "prod-2"],
    outOfStockOrders: [],
  },
  {
    id: "prod-8",
    name: "Canon Ink Cartridges",
    price: 25000,
    originalPrice: 30000,
    image:
      "https://images.unsplash.com/photo-1563890009599-0c7fbe394e86?w=500&q=80",
    rating: 4.0,
    category: "Consumables",
    isNew: false,
    isFeatured: false,
    description:
      "Les cartouches d'encre Canon originales offrent des impressions de haute qualité et des couleurs vives pour vos imprimantes Canon.",
    specs: [
      "Compatible avec les imprimantes Canon PIXMA",
      "Encre de haute qualité",
      "Couleurs vives et précises",
      "Rendement élevé",
      "Installation facile",
      "Emballage écologique",
    ],
    stock: 50,
    relatedProducts: ["prod-4", "prod-3"],
    outOfStockOrders: [],
  },
];

// Define the type for out of stock orders
interface OutOfStockOrder {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
  orderDate: Date;
  status: "pending" | "contacted" | "fulfilled" | "cancelled";
}

// Define the type for products
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  category: string;
  isNew: boolean;
  isFeatured: boolean;
  description: string;
  specs: string[];
  stock: number;
  relatedProducts: string[];
  outOfStockOrders: OutOfStockOrder[];
}

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);
  const { userLocation, getDeliveryZone } = useLocation();
  const deliveryZone = getDeliveryZone();
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const [outOfStockFormData, setOutOfStockFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderReference, setOrderReference] = useState("");

  // Find the product by ID
  const product =
    mockProducts.find((p) => p.id === productId) || mockProducts[0];

  // Find related products
  const relatedProducts = product.relatedProducts
    ? product.relatedProducts
        .map((id) => mockProducts.find((p) => p.id === id))
        .filter(Boolean)
    : [];

  // Format price in CFA format
  const formatPrice = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
  };

  // Calculate discount percentage
  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  // Handle quantity change
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    console.log(`Added ${quantity} of ${product.name} to cart`);
    // Here you would add the product to the cart
  };

  // Handle out of stock order form input changes
  const handleOutOfStockInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setOutOfStockFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate a unique order reference
  const generateOrderReference = () => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `OSO-${timestamp}-${random}`;
  };

  // Handle out of stock order submission
  const handleOutOfStockOrder = () => {
    // Create a new order reference
    const reference = generateOrderReference();
    setOrderReference(reference);

    // Create the order object
    const newOrder: OutOfStockOrder = {
      id: reference,
      productId: product.id,
      customerName: outOfStockFormData.name,
      customerEmail: outOfStockFormData.email,
      customerPhone: outOfStockFormData.phone,
      customerAddress: outOfStockFormData.address,
      notes: outOfStockFormData.notes,
      orderDate: new Date(),
      status: "pending",
    };

    // Find the product in the mockProducts array and add the order to its outOfStockOrders array
    const productIndex = mockProducts.findIndex((p) => p.id === product.id);
    if (productIndex !== -1) {
      mockProducts[productIndex].outOfStockOrders.push(newOrder);
    }

    // Log the order for debugging
    console.log(`Out of stock order for ${product.name}:`, newOrder);
    console.log("Updated product:", mockProducts[productIndex]);

    // Set order as placed
    setOrderPlaced(true);

    // Reset form and close modal after showing confirmation
    setTimeout(() => {
      setOutOfStockFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });
      setShowOutOfStockModal(false);
      // Keep orderPlaced true to show the banner
      // It will stay visible until user navigates away
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-400">
            <Link to="/" className="hover:text-amber-400">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-amber-400">
              Produits
            </Link>
            <span className="mx-2">/</span>
            <Link
              to={`/products/${product.category.toLowerCase()}`}
              className="hover:text-amber-400"
            >
              {product.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-amber-400">{product.name}</span>
          </div>
        </div>

        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>

        {/* Product Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-zinc-900 rounded-lg overflow-hidden">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto object-cover"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                {product.isNew && (
                  <Badge className="bg-red-600 hover:bg-red-700 text-white">
                    Nouveau
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-black">
                    Vedette
                  </Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">
                    -{discountPercentage}%
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">{product.category}</p>
              <h1 className="text-3xl font-bold text-white mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-500"}`}
                  />
                ))}
                <span className="text-sm text-gray-300 ml-2">
                  {product.rating} (120 avis)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-amber-400">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-6">{product.description}</p>

              {/* Stock Status */}
              <div className="mb-6">
                <p className="text-sm">
                  Statut:{" "}
                  {product.stock > 0 ? (
                    <span className="text-green-500">
                      En stock ({product.stock} disponibles)
                    </span>
                  ) : (
                    <span className="text-red-500">Rupture de stock</span>
                  )}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center mb-6">
                <span className="text-sm text-gray-400 mr-4">Quantité:</span>
                <div className="flex items-center border border-zinc-700 rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="h-10 w-10 text-white hover:bg-zinc-800"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    className="h-10 w-10 text-white hover:bg-zinc-800"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {product.stock > 0 ? (
                  <Button
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Ajouter au panier
                  </Button>
                ) : (
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                    onClick={() => setShowOutOfStockModal(true)}
                  >
                    <Clock className="mr-2 h-5 w-5" />
                    Commander (Hors Stock)
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Ajouter aux favoris
                </Button>
              </div>

              {/* Order Confirmation Banner - shows when an order has been placed but modal is closed */}
              {orderPlaced && !showOutOfStockModal && (
                <div className="bg-green-600/20 border border-green-600 rounded-md p-4 mb-6 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-500">
                      Commande Enregistrée!
                    </p>
                    <p className="text-sm text-gray-300">
                      Votre commande{" "}
                      <span className="font-medium text-amber-400">
                        {orderReference}
                      </span>{" "}
                      a été enregistrée. Nous vous contacterons dès que le
                      produit sera disponible.
                    </p>
                  </div>
                </div>
              )}

              {/* Shipping & Returns */}
              <div className="space-y-3 border-t border-zinc-800 pt-6">
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-amber-400 mr-3" />
                  <span className="text-sm">
                    {deliveryZone?.deliveryCost === 0
                      ? `Livraison gratuite à ${userLocation}`
                      : `Livraison à ${userLocation}: ${deliveryZone?.deliveryCost.toLocaleString()} FCFA`}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-amber-400 mr-3" />
                  <span className="text-sm">
                    Délai de livraison estimé: {deliveryZone?.estimatedTime}
                  </span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-amber-400 mr-3" />
                  <span className="text-sm">Garantie 12 mois</span>
                </div>
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 text-amber-400 mr-3" />
                  <span className="text-sm">Retours sous 30 jours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-12">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
              <TabsTrigger value="specs">Spécifications</TabsTrigger>
              <TabsTrigger value="reviews">Avis</TabsTrigger>
              <TabsTrigger value="shipping">Livraison</TabsTrigger>
            </TabsList>
            <TabsContent
              value="specs"
              className="p-6 bg-zinc-900 rounded-b-lg mt-2"
            >
              <h3 className="text-xl font-semibold mb-4">Spécifications</h3>
              <ul className="space-y-2">
                {product.specs.map((spec, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-amber-400 mt-2 mr-3"></div>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent
              value="reviews"
              className="p-6 bg-zinc-900 rounded-b-lg mt-2"
            >
              <h3 className="text-xl font-semibold mb-4">Avis clients</h3>
              <p className="text-gray-400">
                Les avis seront disponibles prochainement.
              </p>
            </TabsContent>
            <TabsContent
              value="shipping"
              className="p-6 bg-zinc-900 rounded-b-lg mt-2"
            >
              <h3 className="text-xl font-semibold mb-4">
                Informations de livraison
              </h3>
              <div className="space-y-4">
                <p>
                  <strong className="text-amber-400">Yaoundé:</strong> Livraison
                  gratuite, 1-2 jours ouvrables
                </p>
                <p>
                  <strong className="text-amber-400">Douala:</strong> 5,000
                  FCFA, 2-3 jours ouvrables
                </p>
                <p>
                  <strong className="text-amber-400">Autres villes:</strong>{" "}
                  10,000 FCFA, 3-5 jours ouvrables
                </p>
                <p>
                  <strong className="text-amber-400">
                    Retrait en magasin:
                  </strong>{" "}
                  Gratuit, disponible le jour même à notre siège à Yaoundé
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct?.id}
                  className="bg-zinc-900 rounded-lg overflow-hidden hover:border border-amber-500 transition-all duration-200"
                >
                  <Link to={`/products/detail/${relatedProduct?.id}`}>
                    <div className="h-48 overflow-hidden">
                      <img
                        src={relatedProduct?.image}
                        alt={relatedProduct?.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2">
                        {relatedProduct?.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-amber-400">
                          {formatPrice(relatedProduct?.price || 0)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Out of Stock Order Modal */}
      <Dialog open={showOutOfStockModal} onOpenChange={setShowOutOfStockModal}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {orderPlaced ? (
                <div className="flex items-center text-green-500">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Commande Enregistrée
                </div>
              ) : (
                "Commander un Produit Hors Stock"
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {orderPlaced
                ? "Votre commande a été enregistrée avec succès. Nous vous contacterons dès que le produit sera disponible."
                : `Remplissez ce formulaire pour commander ${product.name} même s'il est actuellement hors stock.`}
            </DialogDescription>
          </DialogHeader>

          {!orderPlaced ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Votre nom"
                    value={outOfStockFormData.name}
                    onChange={handleOutOfStockInputChange}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+237 6XX XXX XXX"
                    value={outOfStockFormData.phone}
                    onChange={handleOutOfStockInputChange}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={outOfStockFormData.email}
                  onChange={handleOutOfStockInputChange}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse de livraison</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Votre adresse complète"
                  value={outOfStockFormData.address}
                  onChange={handleOutOfStockInputChange}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes supplémentaires</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Informations supplémentaires sur votre commande"
                  value={outOfStockFormData.notes}
                  onChange={handleOutOfStockInputChange}
                  className="bg-zinc-800 border-zinc-700 min-h-[80px]"
                />
              </div>

              <div className="bg-zinc-800 p-3 rounded-md">
                <p className="text-sm text-amber-400 font-medium">
                  Détails du produit:
                </p>
                <p className="text-sm">{product.name}</p>
                <p className="text-sm text-gray-400">
                  Prix: {formatPrice(product.price)}
                </p>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            {orderPlaced ? (
              <Button
                onClick={() => setShowOutOfStockModal(false)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Fermer
              </Button>
            ) : (
              <>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleOutOfStockOrder}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                  disabled={
                    !outOfStockFormData.name ||
                    !outOfStockFormData.email ||
                    !outOfStockFormData.phone
                  }
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Confirmer la commande
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
