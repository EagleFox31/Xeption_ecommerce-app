import apiClient from './api-client';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  inStock: boolean;
  stockQuantity?: number;
  categoryId: string;
  brandId: string;
  categoryName?: string;
  brandName?: string;
  rating?: number;
  specifications?: Record<string, any>;
  features?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const catalogService = {
  // Get all products with optional filters
  getProducts: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const response = await apiClient.get<{success: boolean, data: ProductsResponse}>('/catalog/products', { 
      params: filters 
    });
    return response.data.data;
  },
  
  // Get featured products
  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<{success: boolean, data: Product[]}>('/catalog/products/featured');
    return response.data.data;
  },
  
  // Search products
  searchProducts: async (query: string, filters?: ProductFilters): Promise<ProductsResponse> => {
    const response = await apiClient.get<{success: boolean, data: ProductsResponse}>('/catalog/products/search', {
      params: {
        q: query,
        ...filters
      }
    });
    return response.data.data;
  },
  
  // Get product by ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<{success: boolean, data: Product}>(`/catalog/products/${id}`);
    return response.data.data;
  },
  
  // Get product by SKU
  getProductBySku: async (sku: string): Promise<Product> => {
    const response = await apiClient.get<{success: boolean, data: Product}>(`/catalog/products/sku/${sku}`);
    return response.data.data;
  },
  
  // Get products by category
  getProductsByCategory: async (categoryId: string, filters?: ProductFilters): Promise<ProductsResponse> => {
    const response = await apiClient.get<{success: boolean, data: ProductsResponse}>(`/catalog/products/category/${categoryId}`, {
      params: filters
    });
    return response.data.data;
  },
  
  // Get products by brand
  getProductsByBrand: async (brandId: string, filters?: ProductFilters): Promise<ProductsResponse> => {
    const response = await apiClient.get<{success: boolean, data: ProductsResponse}>(`/catalog/products/brand/${brandId}`, {
      params: filters
    });
    return response.data.data;
  }
};

export default catalogService;