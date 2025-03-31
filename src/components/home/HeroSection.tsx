import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Truck } from "lucide-react";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
}

const HeroSection = ({
  title = "Technologie de Pointe pour Tous les Budgets",
  subtitle = "Découvrez notre sélection premium d'ordinateurs, smartphones et accessoires. Livraison rapide dans tout le 237 !",
  ctaText = "Acheter Maintenant",
  ctaLink = "/products",
  secondaryCtaText = "Nos Services",
  secondaryCtaLink = "/services",
  backgroundImage = "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&q=80",
}: HeroSectionProps) => {
  return (
    <div className="relative w-full h-[500px] bg-black overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: "brightness(0.4)",
        }}
      />

      {/* Gold Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 md:px-8 lg:px-16 max-w-7xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-3xl">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
          {subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Button
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-6 h-auto"
            onClick={() => (window.location.href = ctaLink)}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            {ctaText}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 h-auto"
            onClick={() => (window.location.href = secondaryCtaLink)}
          >
            {secondaryCtaText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Delivery Badge */}
        <div className="absolute bottom-8 right-8 bg-black/80 border border-amber-500 rounded-full px-4 py-2 flex items-center">
          <Truck className="text-amber-500 mr-2 h-5 w-5" />
          <span className="text-white text-sm font-medium">
            Livraison dans tout le 237
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
