import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Mock data for products - this would typically come from an API
const mockProducts = [
  {
    id: "prod-1",
    name: "MacBook Pro M2",
    price: 1200000,
    originalPrice: 1350000,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    rating: 4.5,
    category: "Computers",
    isNew: true,
    isFeatured: true,
    specs: {
      processor: "M2",
      ram: "16GB",
      storage: "512GB",
      screenSize: "14 inch",
    },
  },
  {
    id: "prod-2",
    name: "iPhone 14 Pro Max",
    price: 750000,
    originalPrice: 800000,
    image:
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=500&q=80",
    rating: 4.8,
    category: "Smartphones",
    isNew: true,
    isFeatured: false,
    specs: {
      processor: "A16 Bionic",
      ram: "6GB",
      storage: "256GB",
      screenSize: "6.7 inch",
    },
  },
  {
    id: "prod-3",
    name: "Sony WH-1000XM4",
    price: 180000,
    originalPrice: 220000,
    image:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80",
    rating: 4.7,
    category: "Accessories",
    isNew: false,
    isFeatured: true,
    specs: {
      batteryLife: "30 hours",
      noiseCancel: true,
      wireless: true,
    },
  },
  {
    id: "prod-4",
    name: "HP LaserJet Pro",
    price: 350000,
    originalPrice: 380000,
    image:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80",
    rating: 4.2,
    category: "Consumables",
    isNew: false,
    isFeatured: false,
    specs: {
      printSpeed: "22 ppm",
      wireless: true,
      colorPrint: false,
    },
  },
  {
    id: "prod-5",
    name: "Dell XPS 15",
    price: 980000,
    originalPrice: 1050000,
    image:
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500&q=80",
    rating: 4.6,
    category: "Computers",
    isNew: false,
    isFeatured: true,
    specs: {
      processor: "Intel i7",
      ram: "16GB",
      storage: "1TB",
      screenSize: "15.6 inch",
    },
  },
  {
    id: "prod-6",
    name: "Samsung Galaxy S23",
    price: 650000,
    originalPrice: 700000,
    image:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80",
    rating: 4.4,
    category: "Smartphones",
    isNew: true,
    isFeatured: false,
    specs: {
      processor: "Snapdragon 8 Gen 2",
      ram: "8GB",
      storage: "128GB",
      screenSize: "6.1 inch",
    },
  },
  {
    id: "prod-7",
    name: "Apple AirPods Pro",
    price: 150000,
    originalPrice: 180000,
    image:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80",
    rating: 4.9,
    category: "Accessories",
    isNew: false,
    isFeatured: true,
    specs: {
      batteryLife: "4.5 hours",
      noiseCancel: true,
      wireless: true,
    },
  },
  {
    id: "prod-8",
    name: "Canon Ink Cartridges",
    price: 25000,
    originalPrice: 30000,
    image:
      "https://images.unsplash.com/photo-1563890009599-0c7fbe394e86?w=500&q=80",
    rating: 4.0,
    category: "Consumables",
    isNew: false,
    isFeatured: false,
    specs: {
      colorPrint: true,
      pages: "250 pages",
    },
  },
];

// Define types for product and filters
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  category: string;
  isNew: boolean;
  isFeatured: boolean;
  specs?: Record<string, any>;
}

export interface ProductFilters {
  category: string;
  priceRange: [number, number];
  sortBy: string;
  specs: Record<string, any>;
}

export interface SpecOption {
  label: string;
  value: string;
  category: string;
}

// Extract available specs from products
export const getAvailableSpecs = (): SpecOption[] => {
  const specsMap = new Map<string, Set<string>>();

  mockProducts.forEach((product) => {
    if (product.specs) {
      Object.entries(product.specs).forEach(([key, value]) => {
        if (!specsMap.has(key)) {
          specsMap.set(key, new Set());
        }
        specsMap.get(key)?.add(String(value));
      });
    }
  });

  const result: SpecOption[] = [];

  specsMap.forEach((values, key) => {
    values.forEach((value) => {
      // Determine which category this spec belongs to
      let category = "general";
      if (["processor", "ram", "storage", "screenSize"].includes(key)) {
        category = "computers";
      } else if (["batteryLife", "wireless", "noiseCancel"].includes(key)) {
        category = "accessories";
      } else if (["printSpeed", "colorPrint", "pages"].includes(key)) {
        category = "consumables";
      }

      result.push({
        label: `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`,
        value: `${key}:${value}`,
        category,
      });
    });
  });

  return result;
};

// Hook for product filtering
export const useProductFilters = (initialCategory?: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam =
    searchParams.get("category") || initialCategory || "all";

  const [filters, setFilters] = useState<ProductFilters>({
    category: categoryParam,
    priceRange: [0, 2000000],
    sortBy: "featured",
    specs: {},
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Update URL when category changes
  useEffect(() => {
    setSearchParams({ category: filters.category });
  }, [filters.category, setSearchParams]);

  // Filter products based on all criteria
  const filteredProducts = mockProducts.filter((product) => {
    // Category filter
    const categoryMatch =
      filters.category === "all" ||
      product.category.toLowerCase() === filters.category.toLowerCase();

    // Price range filter
    const priceMatch =
      product.price >= filters.priceRange[0] &&
      product.price <= filters.priceRange[1];

    // Specs filter
    let specsMatch = true;
    if (Object.keys(filters.specs).length > 0 && product.specs) {
      for (const [key, value] of Object.entries(filters.specs)) {
        const [specKey, specValue] = key.split(":");
        if (product.specs[specKey] !== undefined) {
          if (String(product.specs[specKey]) !== specValue) {
            specsMatch = false;
            break;
          }
        } else {
          specsMatch = false;
          break;
        }
      }
    }

    return categoryMatch && priceMatch && specsMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return a.isNew ? -1 : b.isNew ? 1 : 0;
      case "featured":
      default:
        return a.isFeatured ? -1 : b.isFeatured ? 1 : 0;
    }
  });

  // Update filters
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    updateFilters({ category });
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
  };

  return {
    filters,
    updateFilters,
    filteredProducts,
    sortedProducts,
    currentPage,
    setCurrentPage,
    filtersVisible,
    setFiltersVisible,
    handleCategoryChange,
    formatPrice,
    availableSpecs: getAvailableSpecs(),
  };
};
