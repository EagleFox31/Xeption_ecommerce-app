import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  Users,
  BarChart,
  ShieldCheck,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import RFQForm from "@/components/business/RFQForm";
import BusinessQuoteForm from "@/components/business/BusinessQuoteForm";
import { isAuthenticated, getCurrentUser } from "@/services/auth";

const BusinessProcurementPage = () => {
  const [activeTab, setActiveTab] = useState<string>("rfq");
  const [showBusinessAlert, setShowBusinessAlert] = useState<boolean>(false);
  const isLoggedIn = isAuthenticated();
  const currentUser = getCurrentUser();
  const isBusinessClient = currentUser?.isBusinessClient || false;
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in but not a business client, show alert
    if (isLoggedIn && !isBusinessClient) {
      setShowBusinessAlert(true);
    }
  }, [isLoggedIn, isBusinessClient]);

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-900 to-black py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gold-500">
            Solutions Entreprise
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Xeption Network propose des solutions technologiques sur mesure pour
            les entreprises de toutes tailles. De l'approvisionnement en
            matériel à la mise en place d'infrastructures informatiques.
          </p>

          {showBusinessAlert && (
            <Alert className="mt-6 mb-4 bg-blue-900/50 border-blue-800 text-white max-w-3xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Votre compte n'est pas enregistré comme compte entreprise. Pour
                accéder à toutes les fonctionnalités business, veuillez mettre à
                jour votre profil ou contacter notre service client.
              </AlertDescription>
            </Alert>
          )}

          {!isLoggedIn && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button
                asChild
                className="bg-gold-500 hover:bg-gold-600 text-black font-medium"
              >
                <a href="/auth/login">Connexion Entreprise</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-gold-500 text-gold-500 hover:bg-gold-500/10"
              >
                <a href="/auth/register">Créer un Compte Entreprise</a>
              </Button>
            </div>
          )}

          {isLoggedIn && isBusinessClient && (
            <div className="mt-8">
              <Button
                onClick={() => navigate("/business/dashboard")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Accéder à votre tableau de bord
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Benefits */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gold-500">
              Pourquoi choisir Xeption Network pour votre entreprise?
            </h2>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <Building2 className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gold-500">
                    Comptes Entreprise Dédiés
                  </h3>
                  <p className="text-gray-300">
                    Bénéficiez de tarifs préférentiels, d'un support dédié et
                    d'un gestionnaire de compte personnel pour toutes vos
                    commandes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gold-500">
                    Processus RFQ Simplifié
                  </h3>
                  <p className="text-gray-300">
                    Soumettez vos demandes de devis pour des commandes en gros
                    et recevez des propositions personnalisées dans les 24
                    heures.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <Users className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gold-500">
                    Solutions d'Équipe
                  </h3>
                  <p className="text-gray-300">
                    Équipez l'ensemble de votre personnel avec des solutions
                    cohérentes et bénéficiez de formations et d'assistance pour
                    vos équipes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <BarChart className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gold-500">
                    Analyses d'Entreprise
                  </h3>
                  <p className="text-gray-300">
                    Accédez à des rapports détaillés sur l'utilisation et les
                    performances de vos équipements pour optimiser vos
                    investissements technologiques.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <ShieldCheck className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gold-500">
                    Garanties Étendues
                  </h3>
                  <p className="text-gray-300">
                    Profitez de garanties spéciales entreprise et de services de
                    maintenance prioritaires pour minimiser les temps d'arrêt.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div>
            <Tabs
              defaultValue="rfq"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger
                  value="rfq"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  Demande de Devis (RFQ)
                </TabsTrigger>
                <TabsTrigger
                  value="quote"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  Devis Rapide
                </TabsTrigger>
              </TabsList>
              <TabsContent value="rfq" className="mt-4">
                <RFQForm isBusinessClient={isBusinessClient} />
              </TabsContent>
              <TabsContent value="quote" className="mt-4">
                <BusinessQuoteForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProcurementPage;
