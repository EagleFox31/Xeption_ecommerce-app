import React, { useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../product/ProductCard";

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    category: string;
    isNew?: boolean;
    isFeatured?: boolean;
  }>;
}

const FeaturedProducts = ({
  title = "Produits Vedettes",
  subtitle = "Découvrez notre sélection de produits tech les plus populaires",
  products = [
    {
      id: "prod-1",
      name: "MacBook Pro M2 - Le meilleur pour les pros",
      price: 1200000,
      originalPrice: 1350000,
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
      rating: 4.8,
      category: "Ordinateurs",
      isFeatured: true,
    },
    {
      id: "prod-2",
      name: "iPhone 14 Pro - Dernière génération",
      price: 750000,
      originalPrice: 850000,
      image:
        "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=500&q=80",
      rating: 4.9,
      category: "Smartphones",
      isNew: true,
      isFeatured: true,
    },
    {
      id: "prod-3",
      name: "Samsung Galaxy S23 Ultra - Puissance maximale",
      price: 680000,
      originalPrice: 720000,
      image:
        "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80",
      rating: 4.7,
      category: "Smartphones",
      isFeatured: true,
    },
    {
      id: "prod-4",
      name: "Écouteurs Sony WH-1000XM5 - Son premium",
      price: 220000,
      originalPrice: 250000,
      image:
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80",
      rating: 4.6,
      category: "Accessoires",
      isFeatured: true,
    },
    {
      id: "prod-5",
      name: "Dell XPS 15 - Performance et élégance",
      price: 950000,
      image:
        "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500&q=80",
      rating: 4.5,
      category: "Ordinateurs",
      isFeatured: true,
    },
    {
      id: "prod-6",
      name: "Imprimante HP LaserJet Pro - Pour bureau",
      price: 180000,
      originalPrice: 210000,
      image:
        "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80",
      rating: 4.3,
      category: "Consommables",
      isFeatured: true,
    },
  ],
}: FeaturedProductsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const productsPerView = 4; // Number of products to show at once

  const nextSlide = () => {
    if (currentIndex + productsPerView < products.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to the beginning
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(Math.max(0, products.length - productsPerView)); // Go to the end
    }
  };

  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + productsPerView,
  );

  return (
    <section className="w-full py-12 bg-gray-950 text-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="text-gray-400 mt-2">{subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Products carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (280 + 24)}px)` }}
          >
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  rating={product.rating}
                  category={product.category}
                  isNew={product.isNew}
                  isFeatured={product.isFeatured}
                  onAddToCart={() =>
                    console.log(`Added ${product.name} to cart`)
                  }
                  onAddToFavorite={() =>
                    console.log(`Added ${product.name} to favorites`)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination indicators */}
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({
            length: Math.ceil(products.length / productsPerView),
          }).map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${index === Math.floor(currentIndex / productsPerView) ? "w-8 bg-amber-500" : "w-2 bg-gray-700"}`}
              onClick={() => setCurrentIndex(index * productsPerView)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
