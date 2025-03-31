import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Badge } from "../ui/badge";
import {
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Mock data for products
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
  },
];

interface ProductListingProps {
  initialCategory?: string;
}

const ProductListing = ({ initialCategory }: ProductListingProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam =
    searchParams.get("category") || initialCategory || "all";

  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Filter products based on category and price range
  const filteredProducts = mockProducts.filter((product) => {
    const categoryMatch =
      categoryParam === "all" ||
      product.category.toLowerCase() === categoryParam.toLowerCase();
    const priceMatch =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    return categoryMatch && priceMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
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

  // Pagination
  const productsPerPage = 4;
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage,
  );

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSearchParams({ category });
    setCurrentPage(1);
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {categoryParam === "all"
              ? "All Products"
              : `${categoryParam} Products`}
          </h1>
          <p className="text-gray-400">
            Discover our wide range of high-quality tech products
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setFiltersVisible(!filtersVisible)}
            className="w-full border-zinc-700 text-white hover:bg-zinc-800"
          >
            <Filter className="mr-2 h-4 w-4" />
            {filtersVisible ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div
            className={`${filtersVisible ? "block" : "hidden"} lg:block lg:w-1/4 bg-zinc-900 p-4 rounded-lg border border-zinc-800`}
          >
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <SlidersHorizontal className="mr-2 h-4 w-4 text-yellow-500" />
                Filters
              </h3>

              {/* Category Filter */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-gray-400">
                  Category
                </h4>
                <div className="space-y-2">
                  {[
                    "all",
                    "computers",
                    "smartphones",
                    "accessories",
                    "consumables",
                  ].map((category) => (
                    <Badge
                      key={category}
                      variant={
                        categoryParam === category ? "default" : "outline"
                      }
                      className={`mr-2 cursor-pointer ${categoryParam === category ? "bg-yellow-500 text-black" : "hover:bg-zinc-800"}`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-gray-400">
                  Price Range
                </h4>
                <Slider
                  defaultValue={[0, 2000000]}
                  max={2000000}
                  step={50000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="my-4"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-gray-400">
                Showing {paginatedProducts.length} of {filteredProducts.length}{" "}
                products
              </p>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    image={product.image}
                    rating={product.rating}
                    category={product.category}
                    isNew={product.isNew}
                    isFeatured={product.isFeatured}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-zinc-900 rounded-lg">
                <p className="text-gray-400">
                  No products found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                  onClick={() => {
                    setSearchParams({ category: "all" });
                    setPriceRange([0, 2000000]);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page
                            ? "bg-yellow-500 text-black"
                            : "border-zinc-700 text-white hover:bg-zinc-800"
                        }
                      >
                        {page}
                      </Button>
                    ),
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
