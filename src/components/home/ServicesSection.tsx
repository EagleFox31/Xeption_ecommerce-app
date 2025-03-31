import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, RefreshCw, Clock } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  ctaText: string;
  bgColor: string;
}

const ServiceCard = ({
  title = "Service Title",
  description = "Service description goes here. This explains what the service offers to customers.",
  icon = <Wrench className="h-8 w-8 text-amber-400" />,
  ctaText = "Learn More",
  bgColor = "bg-zinc-800",
}: ServiceCardProps) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 shadow-lg flex flex-col h-full`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300 mb-6 flex-grow">{description}</p>
      <Button className="bg-amber-500 hover:bg-amber-600 text-black w-full mt-auto flex items-center justify-center gap-2">
        {ctaText} <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

const ServicesSection = () => {
  const services = [
    {
      title: "Trade-in Services (Troc)",
      description:
        "Échangez votre ancien appareil contre un nouveau avec notre service de troc premium. Obtenez la meilleure valeur pour votre équipement usagé.",
      icon: <RefreshCw className="h-8 w-8 text-amber-400" />,
      ctaText: "Échanger Maintenant",
      bgColor: "bg-zinc-800",
    },
    {
      title: "Repair Services",
      description:
        "Nos techniciens qualifiés réparent vos appareils avec expertise. Service rapide et garantie sur toutes les réparations.",
      icon: <Wrench className="h-8 w-8 text-amber-400" />,
      ctaText: "Réserver une Réparation",
      bgColor: "bg-zinc-900",
    },
    {
      title: "Express Service",
      description:
        "Service accéléré pour les réparations urgentes. Votre appareil sera pris en charge en priorité par notre équipe technique.",
      icon: <Clock className="h-8 w-8 text-amber-400" />,
      ctaText: "Service Express",
      bgColor: "bg-zinc-800",
    },
  ];

  return (
    <section className="bg-black py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Nos Services <span className="text-amber-500">Premium</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Découvrez nos services spécialisés pour tous vos besoins
            technologiques. Chez Xeption Network, nous allons au-delà de la
            simple vente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              ctaText={service.ctaText}
              bgColor={service.bgColor}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black"
          >
            Voir Tous Nos Services
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
