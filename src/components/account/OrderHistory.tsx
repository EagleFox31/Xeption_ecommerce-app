import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Package, ChevronRight, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock order type
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  date: Date;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: "ORD-2023-001",
    date: new Date(2023, 6, 15),
    status: "delivered",
    total: 1299000,
    trackingNumber: "XPT-12345-CM",
    items: [
      {
        id: "item-1",
        name: "MacBook Air M2",
        price: 1299000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&q=80",
      },
    ],
  },
  {
    id: "ORD-2023-002",
    date: new Date(2023, 8, 3),
    status: "shipped",
    total: 699000,
    trackingNumber: "XPT-12346-CM",
    items: [
      {
        id: "item-2",
        name: "iPhone 14",
        price: 599000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=300&q=80",
      },
      {
        id: "item-3",
        name: "Coque iPhone 14 Premium",
        price: 25000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1603313011638-94aa4b5ef0eb?w=300&q=80",
      },
      {
        id: "item-4",
        name: "Chargeur USB-C 20W",
        price: 75000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80",
      },
    ],
  },
  {
    id: "ORD-2023-003",
    date: new Date(2023, 9, 20),
    status: "processing",
    total: 450000,
    items: [
      {
        id: "item-5",
        name: "Écouteurs AirPods Pro",
        price: 450000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&q=80",
      },
    ],
  },
];

// Helper function to format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(price);
};

// Helper function to get status badge color
const getStatusBadge = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-900/20 text-yellow-500 border-yellow-500"
        >
          En attente
        </Badge>
      );
    case "processing":
      return (
        <Badge
          variant="outline"
          className="bg-blue-900/20 text-blue-500 border-blue-500"
        >
          En traitement
        </Badge>
      );
    case "shipped":
      return (
        <Badge
          variant="outline"
          className="bg-purple-900/20 text-purple-500 border-purple-500"
        >
          Expédié
        </Badge>
      );
    case "delivered":
      return (
        <Badge
          variant="outline"
          className="bg-green-900/20 text-green-500 border-green-500"
        >
          Livré
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant="outline"
          className="bg-red-900/20 text-red-500 border-red-500"
        >
          Annulé
        </Badge>
      );
    default:
      return null;
  }
};

const OrderHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter orders based on search term and status filter
  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          Historique des commandes
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Filtrer par statut" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="processing">En traitement</SelectItem>
                <SelectItem value="shipped">Expédié</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-white">
                  Aucune commande trouvée
                </h3>
                <p className="text-gray-400 mt-2">
                  {searchTerm || statusFilter !== "all"
                    ? "Essayez de modifier vos filtres de recherche."
                    : "Vous n'avez pas encore passé de commande."}
                </p>
                {(searchTerm || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    className="mt-4 border-gray-600 text-white hover:bg-gray-700"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="bg-gray-800 border-gray-700 overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <CardTitle className="text-white">
                        Commande {order.id}
                      </CardTitle>
                      <p className="text-sm text-gray-400 mt-1">
                        {format(order.date, "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div className="flex items-center mt-2 md:mt-0 space-x-3">
                      {getStatusBadge(order.status)}
                      <span className="text-lg font-semibold text-white">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3 bg-gray-700/30 p-3 rounded-md"
                      >
                        <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-700">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4 bg-gray-700" />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      {order.trackingNumber && (
                        <p className="text-sm text-gray-400">
                          Numéro de suivi:{" "}
                          <span className="text-white">
                            {order.trackingNumber}
                          </span>
                        </p>
                      )}
                    </div>
                    <Link to={`/account/orders/${order.id}`}>
                      <Button
                        variant="outline"
                        className="mt-3 sm:mt-0 border-gold-500 text-gold-500 hover:bg-gold-500/10"
                      >
                        Détails de la commande
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
