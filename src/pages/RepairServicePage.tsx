import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Wrench,
  Clock,
  CheckCircle,
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Printer,
} from "lucide-react";
import RepairAppointmentForm from "@/components/repair/RepairAppointmentForm";
import RepairServicesList from "@/components/repair/RepairServicesList";

const RepairServicePage = () => {
  return (
    <div className="min-h-screen bg-black text-white pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-900 to-black py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gold-500">
            Service de Réparation
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Xeption Network propose des services de réparation professionnels
            pour tous vos appareils électroniques. Nos techniciens certifiés
            vous garantissent un service rapide et de qualité.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center bg-gray-800 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-300">Techniciens certifiés</span>
            </div>
            <div className="flex items-center bg-gray-800 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-300">
                Garantie sur les réparations
              </span>
            </div>
            <div className="flex items-center bg-gray-800 px-4 py-2 rounded-full">
              <Clock className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-300">Service rapide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger
              value="services"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Nos Services
            </TabsTrigger>
            <TabsTrigger
              value="appointment"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Prendre Rendez-vous
            </TabsTrigger>
          </TabsList>
          <TabsContent value="services" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gold-500">
                  Nos Services de Réparation
                </h2>
                <p className="text-gray-300 mb-6">
                  Chez Xeption Network, nous réparons une large gamme
                  d'appareils électroniques. Nos techniciens sont formés pour
                  diagnostiquer et résoudre rapidement les problèmes tout en
                  utilisant des pièces de rechange de haute qualité.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-800 p-2 rounded-full">
                      <Smartphone className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-white">Smartphones</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-800 p-2 rounded-full">
                      <Laptop className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-white">Ordinateurs</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-800 p-2 rounded-full">
                      <Tv className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-white">Télévisions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-800 p-2 rounded-full">
                      <Headphones className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-white">Audio</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-800 p-2 rounded-full">
                      <Printer className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-white">Imprimantes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-800 p-2 rounded-full">
                      <Wrench className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-white">Autres appareils</span>
                  </div>
                </div>
              </div>
              <div>
                <Card className="bg-gray-900 border-gray-800 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-gold-500">
                      Processus de Réparation
                    </h3>
                    <ol className="space-y-4">
                      <li className="flex items-start">
                        <div className="bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-gold-500 font-bold mr-3 mt-0.5 flex-shrink-0">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Diagnostic</h4>
                          <p className="text-gray-400 text-sm">
                            Nos techniciens examinent votre appareil pour
                            identifier précisément le problème.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-gold-500 font-bold mr-3 mt-0.5 flex-shrink-0">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Devis</h4>
                          <p className="text-gray-400 text-sm">
                            Nous vous fournissons un devis détaillé avant de
                            commencer toute réparation.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-gold-500 font-bold mr-3 mt-0.5 flex-shrink-0">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Réparation</h4>
                          <p className="text-gray-400 text-sm">
                            Nos experts réparent votre appareil avec des pièces
                            de qualité.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-gold-500 font-bold mr-3 mt-0.5 flex-shrink-0">
                          4
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Tests</h4>
                          <p className="text-gray-400 text-sm">
                            Nous testons rigoureusement votre appareil pour
                            garantir son bon fonctionnement.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-gold-500 font-bold mr-3 mt-0.5 flex-shrink-0">
                          5
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Livraison</h4>
                          <p className="text-gray-400 text-sm">
                            Votre appareil réparé vous est remis avec une
                            garantie sur la réparation.
                          </p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </Card>
              </div>
            </div>

            <div className="mt-12">
              <RepairServicesList />
            </div>
          </TabsContent>
          <TabsContent value="appointment" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <RepairAppointmentForm />
              </div>
              <div>
                <Card className="bg-gray-900 border-gray-800">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-gold-500">
                      Informations Utiles
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-white">Horaires</h4>
                        <p className="text-gray-400 text-sm">
                          Lundi - Vendredi: 9h - 18h
                          <br />
                          Samedi: 10h - 16h
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Adresse</h4>
                        <p className="text-gray-400 text-sm">
                          Quartier Elig-Essono, Yaoundé, Cameroun
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Contact</h4>
                        <p className="text-gray-400 text-sm">
                          Téléphone: +237 6XX XXX XXX
                          <br />
                          Email: service@xeption.cm
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Garantie</h4>
                        <p className="text-gray-400 text-sm">
                          Toutes nos réparations sont garanties 3 mois.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RepairServicePage;
