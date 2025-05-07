import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  FileText,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { getCurrentUser } from "@/services/auth";
import { getUserRFQRequests, RFQRequest } from "@/services/rfqService";

const BusinessClientDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [userRFQs, setUserRFQs] = useState<RFQRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const user = getCurrentUser();

  useEffect(() => {
    // Redirect if not a business client
    if (!user || !user.isBusinessClient) {
      navigate("/auth/login");
      return;
    }

    // Load user's RFQ requests
    if (user) {
      const rfqs = getUserRFQRequests(user.id);
      setUserRFQs(rfqs);
      setLoading(false);
    }
  }, [navigate, user]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const getStatusBadge = (status: RFQRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          >
            En attente
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-500 border-blue-500/20"
          >
            En traitement
          </Badge>
        );
      case "quoted":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-500 border-purple-500/20"
          >
            Devis envoyé
          </Badge>
        );
      case "accepted":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20"
          >
            Accepté
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-500 border-red-500/20"
          >
            Rejeté
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-gold-500/10 text-gold-500 border-gold-500/20"
          >
            Complété
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <div className="bg-gradient-to-b from-gray-900 to-black py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gold-500">
                Tableau de Bord Entreprise
              </h1>
              <p className="text-gray-300 mt-1">
                Bienvenue, {user.firstName} | {user.companyName}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                onClick={() => navigate("/business")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Nouvelle Demande de Devis
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs
          defaultValue="overview"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full md:w-auto grid-cols-3 bg-gray-800">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Aperçu
            </TabsTrigger>
            <TabsTrigger
              value="rfqs"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Demandes de Devis
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Commandes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold-500 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-red-600" />
                    Demandes de Devis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{userRFQs.length}</div>
                  <p className="text-gray-400 text-sm mt-1">
                    Total des demandes
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="link"
                    className="text-gold-500 p-0"
                    onClick={() => setActiveTab("rfqs")}
                  >
                    Voir toutes les demandes
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold-500 flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2 text-red-600" />
                    Commandes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-gray-400 text-sm mt-1">
                    Commandes en cours
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="link"
                    className="text-gold-500 p-0"
                    onClick={() => setActiveTab("orders")}
                  >
                    Voir toutes les commandes
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold-500 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-red-600" />
                    Profil Entreprise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">{user.companyName}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {user.businessType} · {user.employeeCount} employés
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="text-gold-500 p-0">
                    Modifier le profil
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rfqs" className="mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold-500">
                  Vos Demandes de Devis
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Suivez l'état de vos demandes de devis et consultez les
                  propositions reçues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-gray-400">
                    Chargement...
                  </p>
                ) : userRFQs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">
                      Vous n'avez pas encore de demandes de devis.
                    </p>
                    <Button
                      onClick={() => navigate("/business")}
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Créer une demande
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userRFQs.map((rfq) => (
                      <div
                        key={rfq.id}
                        className="p-4 border border-gray-800 rounded-lg"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-white">
                                {rfq.productCategory}
                              </h3>
                              <span className="mx-2 text-gray-500">•</span>
                              <span className="text-sm text-gray-400">
                                {rfq.id}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                              Quantité: {rfq.quantity} • Délai: {rfq.timeframe}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0 flex items-center">
                            {getStatusBadge(rfq.status)}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2 text-gray-400 hover:text-white"
                            >
                              Détails
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold-500">Vos Commandes</CardTitle>
                <CardDescription className="text-gray-400">
                  Suivez l'état de vos commandes et consultez l'historique de
                  vos achats.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">
                    Vous n'avez pas encore de commandes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessClientDashboard;
