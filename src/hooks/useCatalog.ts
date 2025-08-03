import { useQuery, UseQueryOptions } from 'react-query';
import catalogService, { Product, ProductFilters, ProductsResponse } from '../services/catalogService';

export const CATALOG_KEYS = {
  all: ['catalog'] as const,
  products: (filters?: ProductFilters) => [...CATALOG_KEYS.all, 'products', filters] as const,
  featured: () => [...CATALOG_KEYS.all, 'featured'] as const,
  search: (query: string, filters?: ProductFilters) => [...CATALOG_KEYS.all, 'search', query, filters] as const,
  product: (id: string) => [...CATALOG_KEYS.all, 'product', id] as const,
  productBySku: (sku: string) => [...CATALOG_KEYS.all, 'product', 'sku', sku] as const,
  category: (categoryId: string, filters?: ProductFilters) => [...CATALOG_KEYS.all, 'category', categoryId, filters] as const,
  brand: (brandId: string, filters?: ProductFilters) => [...CATALOG_KEYS.all, 'brand', brandId, filters] as const,
};

// Hook for fetching products with pagination and filters
export const useProducts = (
  filters?: ProductFilters,
  options?: UseQueryOptions<ProductsResponse, Error, ProductsResponse>
) => {
  return useQuery<ProductsResponse, Error>(
    CATALOG_KEYS.products(filters),
    () => catalogService.getProducts(filters),
    {
      keepPreviousData: true, // Keep previous data while fetching new data
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options
    }
  );
};

// Hook for fetching featured products
export const useFeaturedProducts = (
  options?: UseQueryOptions<Product[], Error, Product[]>
) => {
  return useQuery<Product[], Error>(
    CATALOG_KEYS.featured(),
    () => catalogService.getFeaturedProducts(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes since featured products change less frequently
      ...options
    }
  );
};

// Hook for searching products
export const useSearchProducts = (
  query: string,
  filters?: ProductFilters,
  options?: UseQueryOptions<ProductsResponse, Error, ProductsResponse>
) => {
  return useQuery<ProductsResponse, Error>(
    CATALOG_KEYS.search(query, filters),
    () => catalogService.searchProducts(query, filters),
    {
      enabled: !!query && query.length > 2, // Only search when query is at least 3 characters
      keepPreviousData: true,
      ...options
    }
  );
};

// Hook for fetching a single product by ID
export const useProduct = (
  id: string,
  options?: UseQueryOptions<Product, Error, Product>
) => {
  return useQuery<Product, Error>(
    CATALOG_KEYS.product(id),
    () => catalogService.getProductById(id),
    {
      enabled: !!id, // Only fetch when id is available
      ...options
    }
  );
};

// Hook for fetching a single product by SKU
export const useProductBySku = (
  sku: string,
  options?: UseQueryOptions<Product, Error, Product>
) => {
  return useQuery<Product, Error>(
    CATALOG_KEYS.productBySku(sku),
    () => catalogService.getProductBySku(sku),
    {
      enabled: !!sku, // Only fetch when sku is available
      ...options
    }
  );
};

// Hook for fetching products by category
export const useProductsByCategory = (
  categoryId: string,
  filters?: ProductFilters,
  options?: UseQueryOptions<ProductsResponse, Error, ProductsResponse>
) => {
  return useQuery<ProductsResponse, Error>(
    CATALOG_KEYS.category(categoryId, filters),
    () => catalogService.getProductsByCategory(categoryId, filters),
    {
      enabled: !!categoryId, // Only fetch when categoryId is available
      keepPreviousData: true,
      ...options
    }
  );
};

// Hook for fetching products by brand
export const useProductsByBrand = (
  brandId: string,
  filters?: ProductFilters,
  options?: UseQueryOptions<ProductsResponse, Error, ProductsResponse>
) => {
  return useQuery<ProductsResponse, Error>(
    CATALOG_KEYS.brand(brandId, filters),
    () => catalogService.getProductsByBrand(brandId, filters),
    {
      enabled: !!brandId, // Only fetch when brandId is available
      keepPreviousData: true,
      ...options
    }
  );
};