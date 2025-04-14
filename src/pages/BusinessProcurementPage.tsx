import React from "react";
import {
  Building2,
  FileText,
  Users,
  BarChart,
  ShieldCheck,
} from "lucide-react";
import BusinessQuoteForm from "@/components/business/BusinessQuoteForm";

const BusinessProcurementPage = () => {
  return (
    <div className="min-h-screen bg-black text-white pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-900 to-black py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gold">
            Solutions Entreprise
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Xeption Network propose des solutions technologiques sur mesure pour
            les entreprises de toutes tailles. De l'approvisionnement en
            matériel à la mise en place d'infrastructures informatiques.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Benefits */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gold">
              Pourquoi choisir Xeption Network pour votre entreprise?
            </h2>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <Building2 className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gold">
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
                  <h3 className="font-semibold text-xl text-gold">
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
                  <h3 className="font-semibold text-xl text-gold">
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
                  <h3 className="font-semibold text-xl text-gold">
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
                  <h3 className="font-semibold text-xl text-gold">
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

          {/* Right Column - Form */}
          <div>
            <BusinessQuoteForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProcurementPage;
