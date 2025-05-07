import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Printer,
  Wrench,
} from "lucide-react";

interface RepairService {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  price: string;
  estimatedTime: string;
  popular?: boolean;
}

const repairServices: RepairService[] = [
  {
    id: "smartphone-repair",
    title: "Réparation de Smartphones",
    description:
      "Réparation d'écrans, batteries, problèmes logiciels et matériels pour tous les modèles de smartphones.",
    icon: <Smartphone className="h-8 w-8 text-red-600" />,
    price: "À partir de 15,000 FCFA",
    estimatedTime: "1-3 heures",
    popular: true,
  },
  {
    id: "laptop-repair",
    title: "Réparation d'Ordinateurs Portables",
    description:
      "Réparation de problèmes matériels et logiciels, remplacement d'écrans, claviers et batteries.",
    icon: <Laptop className="h-8 w-8 text-red-600" />,
    price: "À partir de 25,000 FCFA",
    estimatedTime: "24-48 heures",
    popular: true,
  },
  {
    id: "tv-repair",
    title: "Réparation de Télévisions",
    description:
      "Réparation de téléviseurs LCD, LED, OLED et Smart TV de toutes marques.",
    icon: <Tv className="h-8 w-8 text-red-600" />,
    price: "À partir de 30,000 FCFA",
    estimatedTime: "2-5 jours",
  },
  {
    id: "audio-repair",
    title: "Réparation Audio",
    description:
      "Réparation d'écouteurs, casques, enceintes et systèmes audio.",
    icon: <Headphones className="h-8 w-8 text-red-600" />,
    price: "À partir de 10,000 FCFA",
    estimatedTime: "1-3 jours",
  },
  {
    id: "printer-repair",
    title: "Réparation d'Imprimantes",
    description:
      "Réparation et maintenance d'imprimantes jet d'encre et laser.",
    icon: <Printer className="h-8 w-8 text-red-600" />,
    price: "À partir de 20,000 FCFA",
    estimatedTime: "24-48 heures",
  },
  {
    id: "other-repair",
    title: "Autres Réparations",
    description:
      "Services de réparation pour d'autres appareils électroniques. Contactez-nous pour plus d'informations.",
    icon: <Wrench className="h-8 w-8 text-red-600" />,
    price: "Sur devis",
    estimatedTime: "Variable",
  },
];

const RepairServicesList = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gold-500">
        Nos Tarifs et Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repairServices.map((service) => (
          <Card
            key={service.id}
            className="bg-gray-900 border-gray-800 overflow-hidden"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="bg-gray-800 p-3 rounded-lg">{service.icon}</div>
                {service.popular && (
                  <Badge className="bg-gold-500 text-black">Populaire</Badge>
                )}
              </div>
              <CardTitle className="text-white mt-3">{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">{service.description}</p>
              <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                <div>
                  <p className="text-sm text-gray-400">Prix</p>
                  <p className="text-gold-500 font-semibold">{service.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Délai estimé</p>
                  <p className="text-white">{service.estimatedTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RepairServicesList;
