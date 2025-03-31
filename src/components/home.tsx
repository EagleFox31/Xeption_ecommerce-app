import React from "react";
import HeroSection from "./home/HeroSection";
import ProductCategories from "./home/ProductCategories";
import FeaturedProducts from "./home/FeaturedProducts";
import ServicesSection from "./home/ServicesSection";
import BusinessSection from "./home/BusinessSection";
import LocationSection from "./home/LocationSection";

interface HomePageProps {
  // Props can be added here if needed in the future
}

const HomePage: React.FC<HomePageProps> = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <HeroSection
        title="Technologie de Pointe pour Tous les Budgets"
        subtitle="Découvrez notre sélection premium d'ordinateurs, smartphones et accessoires. Livraison rapide dans tout le 237 !"
        ctaText="Acheter Maintenant"
        secondaryCtaText="Nos Services"
      />

      {/* Product Categories Section */}
      <ProductCategories />

      {/* Featured Products Section */}
      <FeaturedProducts
        title="Produits Vedettes"
        subtitle="Découvrez notre sélection de produits tech les plus populaires"
      />

      {/* Services Section */}
      <ServicesSection />

      {/* Business Section */}
      <BusinessSection
        title="Solutions Entreprise"
        description="Xeption Network propose des solutions technologiques sur mesure pour les entreprises de toutes tailles. De l'approvisionnement en matériel à la mise en place d'infrastructures informatiques, nous aidons votre entreprise à rester à la pointe du paysage numérique."
        ctaText="Demander un Devis"
      />

      {/* Location Section */}
      <LocationSection headquartersAddress="Quartier Elig-Essono, Yaoundé, Cameroun" />

      {/* Footer would be imported and rendered here */}
    </div>
  );
};

export default HomePage;
