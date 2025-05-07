import React from "react";
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
import { Checkbox } from "../ui/checkbox";
import {
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useProductFilters, SpecOption } from "../../hooks/useProductFilters";

interface ProductListingProps {
  initialCategory?: string;
}

const ProductListing = ({ initialCategory }: ProductListingProps) => {
  const {
    filters,
    updateFilters,
    sortedProducts,
    currentPage,
    setCurrentPage,
    filtersVisible,
    setFiltersVisible,
    handleCategoryChange,
    formatPrice,
    availableSpecs,
  } = useProductFilters(initialCategory);

  // Pagination
  const productsPerPage = 4;
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage,
  );

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
                  value={filters.priceRange}
                  onValueChange={(value) =>
                    updateFilters({ priceRange: value as [number, number] })
                  }
                  className="my-4"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{formatPrice(filters.priceRange[0])}</span>
                  <span>{formatPrice(filters.priceRange[1])}</span>
                </div>
              </div>

              {/* Specifications Filter */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-gray-400">
                  Specifications
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {availableSpecs
                    .filter(
                      (spec) =>
                        filters.category === "all" ||
                        spec.category === "general" ||
                        spec.category === filters.category.toLowerCase(),
                    )
                    .map((spec: SpecOption) => (
                      <div
                        key={spec.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={spec.value}
                          checked={!!filters.specs[spec.value]}
                          onCheckedChange={(checked) => {
                            const newSpecs = { ...filters.specs };
                            if (checked) {
                              newSpecs[spec.value] = true;
                            } else {
                              delete newSpecs[spec.value];
                            }
                            updateFilters({ specs: newSpecs });
                          }}
                          className="border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                        />
                        <label
                          htmlFor={spec.value}
                          className="text-sm text-gray-300 cursor-pointer"
                        >
                          {spec.label}
                        </label>
                      </div>
                    ))}
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

              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilters({ sortBy: value })}
              >
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
