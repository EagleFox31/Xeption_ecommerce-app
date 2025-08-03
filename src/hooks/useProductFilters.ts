import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useProducts, useProductsByCategory } from './useCatalog';

export interface SpecOption {
  label: string;
  value: string;
  category: string;
}

interface ProductFilters {
  category: string;
  priceRange: [number, number];
  sortBy: string;
  specs: Record<string, boolean>;
}

export const useProductFilters = (initialCategory?: string) => {
  const { category: categoryParam } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Default to URL param, then prop, then 'all'
  const activeCategory = categoryParam || initialCategory || 'all';
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<ProductFilters>({
    category: activeCategory,
    priceRange: [0, 2000000],
    sortBy: searchParams.get('sort') || 'featured',
    specs: {},
  });
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);
  
  // Fetch products based on category
  const {
    data: productsData,
    isLoading,
    error
  } = activeCategory === 'all'
    ? useProducts({
        page: 1,
        limit: 100, // Get more products for client-side filtering
        sort: filters.sortBy === 'price-low' ? 'price' 
            : filters.sortBy === 'price-high' ? '-price'
            : filters.sortBy === 'newest' ? '-createdAt'
            : filters.sortBy === 'rating' ? '-rating'
            : 'featured',
      })
    : useProductsByCategory(
        activeCategory,
        {
          page: 1,
          limit: 100,
          sort: filters.sortBy === 'price-low' ? 'price' 
              : filters.sortBy === 'price-high' ? '-price'
              : filters.sortBy === 'newest' ? '-createdAt'
              : filters.sortBy === 'rating' ? '-rating'
              : 'featured',
        }
      );
  
  // Additional client-side filtering for price range and specs
  const filteredProducts = (productsData?.items || []).filter(product => {
    // Price filter
    if (
      product.price < filters.priceRange[0] ||
      product.price > filters.priceRange[1]
    ) {
      return false;
    }
    
    // Specs filter
    if (Object.keys(filters.specs).length > 0) {
      // This is a simplified approach - would need to be adapted to actual product specs structure
      const productSpecsValues = Object.keys(product.specifications || {});
      return Object.keys(filters.specs).every(spec => 
        productSpecsValues.includes(spec)
      );
    }
    
    return true;
  });
  
  // Sort products (if needed beyond what API provides)
  const sortedProducts = [...filteredProducts];
  
  // Update filters
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Update URL params for key filters
    if (newFilters.category || newFilters.sortBy) {
      const newParams = new URLSearchParams(searchParams);
      
      if (newFilters.category) {
        newParams.set('category', newFilters.category);
      }
      
      if (newFilters.sortBy) {
        newParams.set('sort', newFilters.sortBy);
      }
      
      setSearchParams(newParams);
    }
  };
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    updateFilters({ category });
  };
  
  // Set price range directly (for reset button)
  const setPriceRange = (range: [number, number]) => {
    updateFilters({ priceRange: range });
  };
  
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  // Available specs options (would come from API in a real implementation)
  const availableSpecs: SpecOption[] = [
    { label: 'SSD Storage', value: 'ssd', category: 'computers' },
    { label: 'HDD Storage', value: 'hdd', category: 'computers' },
    { label: 'Touchscreen', value: 'touchscreen', category: 'computers' },
    { label: 'Dedicated GPU', value: 'gpu', category: 'computers' },
    { label: '5G Compatible', value: '5g', category: 'smartphones' },
    { label: 'AMOLED Display', value: 'amoled', category: 'smartphones' },
    { label: 'Wireless Charging', value: 'wireless-charging', category: 'smartphones' },
    { label: 'Water Resistant', value: 'water-resistant', category: 'general' },
    { label: 'Bluetooth', value: 'bluetooth', category: 'general' },
    { label: 'USB-C', value: 'usb-c', category: 'general' },
  ];
  
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
    isLoading,
    error,
    availableSpecs,
    setPriceRange,
    setSearchParams,
  };
};
