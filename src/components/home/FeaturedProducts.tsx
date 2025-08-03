import React, { useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import ProductCard from "../product/ProductCard";
import { useFeaturedProducts } from "@/hooks/useCatalog";
import { Product } from "@/services/catalogService";
import { useCart } from "@/hooks/useCart";

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  products?: Array<Product | {
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

// Helper function to prepare product data for display
const prepareProductForDisplay = (product: any) => {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice || product.price * 1.2,
    image: product.images?.[0] || product.image || '/placeholder.jpg',
    rating: product.rating || 4,
    category: product.categoryName || product.categoryId || product.category || 'unknown',
    isNew: product.isNew || (product.createdAt ? 
      (Date.now() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) 
      : false),
    isFeatured: product.isFeatured || product.features?.includes('featured') || false
  };
};

const FeaturedProducts = ({
  title = "Produits Vedettes",
  subtitle = "Découvrez notre sélection de produits tech les plus populaires",
  products: propProducts,
}: FeaturedProductsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const productsPerView = 4; // Number of products to show at once
  
  // Get cart functionality
  const { addToCart, isAddingToCart } = useCart();
  
  // Fetch featured products from the API
  const { data: featuredProducts, isLoading, error } = useFeaturedProducts();
  
  // Use provided products prop or API data
  const products = propProducts || featuredProducts || [];
  
  // Handle adding to cart
  const handleAddToCart = (product: any) => {
    addToCart({ productId: product.id, quantity: 1 });
  };

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
              disabled={isLoading || products.length <= productsPerView}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              disabled={isLoading || products.length <= productsPerView}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Products carousel */}
        <div className="relative overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
              <span className="ml-3 text-gray-400">Loading featured products...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <p className="text-gray-400">Failed to load featured products</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <p className="text-gray-400">No featured products available</p>
            </div>
          ) : (
            <div
              className="flex gap-6 transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (280 + 24)}px)` }}
            >
              {products.map((product, index) => {
                const displayProduct = prepareProductForDisplay(product);
                return (
                  <div key={displayProduct.id || index} className="flex-shrink-0">
                    <ProductCard
                      id={displayProduct.id}
                      name={displayProduct.name}
                      price={displayProduct.price}
                      originalPrice={displayProduct.originalPrice}
                      image={displayProduct.image}
                      rating={displayProduct.rating}
                      category={displayProduct.category}
                      isNew={displayProduct.isNew}
                      isFeatured={displayProduct.isFeatured}
                      onAddToCart={() => handleAddToCart(product)}
                      onAddToFavorite={() =>
                        console.log(`Added ${displayProduct.name} to favorites`)
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination indicators */}
        {products.length > 0 && (
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
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
