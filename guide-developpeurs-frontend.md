# Guide d'Utilisation de l'API Xeption E-commerce pour les Développeurs Frontend

## Sommaire
1. [Introduction](#introduction)
2. [Configuration Initiale](#configuration-initiale)
3. [Authentification](#authentification)
4. [Utilisation des Endpoints Principaux](#utilisation-des-endpoints-principaux)
5. [Gestion des Erreurs](#gestion-des-erreurs)
6. [Bonnes Pratiques](#bonnes-pratiques)
7. [Exemples Pratiques](#exemples-pratiques)
8. [Outils Recommandés](#outils-recommandés)

## Introduction

Ce guide est destiné aux développeurs frontend travaillant sur l'application Xeption E-commerce. Il fournit les informations nécessaires pour interagir efficacement avec l'API backend, en utilisant une approche structurée et des exemples concrets.

L'API Xeption E-commerce est basée sur une architecture REST et suit les principes de Clean Architecture (Architecture Hexagonale). Toutes les interactions se font via HTTP/HTTPS, avec un format de données JSON.

## Configuration Initiale

### URL de Base

Pour le développement local:
```
http://localhost:3000/api
```

Pour l'environnement de staging:
```
https://api-staging.xeption.com/api
```

Pour l'environnement de production:
```
https://api.xeption.com/api
```

### Configuration du Client HTTP

Exemple avec Axios:

```typescript
// api/config.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs d'authentification (401)
    if (error.response && error.response.status === 401) {
      // Rediriger vers la page de login ou rafraîchir le token
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Authentification

L'API utilise l'authentification JWT (JSON Web Token). Voici les étapes pour authentifier un utilisateur:

### 1. Connexion

```typescript
// services/auth.service.ts
import apiClient from '../api/config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  
  // Stocker le token pour les futures requêtes
  localStorage.setItem('auth_token', response.data.access_token);
  localStorage.setItem('user_data', JSON.stringify(response.data.user));
  
  return response.data;
};
```

### 2. Déconnexion

```typescript
export const logout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  // Rediriger vers la page de login
  window.location.href = '/login';
};
```

### 3. Inscription

```typescript
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', userData);
  
  // Stocker le token pour les futures requêtes
  localStorage.setItem('auth_token', response.data.access_token);
  localStorage.setItem('user_data', JSON.stringify(response.data.user));
  
  return response.data;
};
```

### 4. Récupération du Profil Utilisateur

```typescript
interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  createdAt: string;
  // Autres champs du profil...
}

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/auth/profile');
  return response.data;
};
```

## Utilisation des Endpoints Principaux

### Catalogue de Produits

```typescript
// services/catalog.service.ts
import apiClient from '../api/config';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  // Autres propriétés...
}

interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

interface ProductFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sortBy?: 'price' | 'name' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const getProducts = async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
  // Construire les paramètres de requête
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });
  
  const response = await apiClient.get<ProductsResponse>('/catalog/products', { params });
  return response.data;
};

export const getProductById = async (productId: string): Promise<Product> => {
  const response = await apiClient.get<Product>(`/catalog/products/${productId}`);
  return response.data;
};
```

### Panier et Commandes

```typescript
// services/cart.service.ts
import apiClient from '../api/config';

interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  productImage: string;
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface AddCartItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export const getCurrentCart = async (): Promise<Cart> => {
  const response = await apiClient.get<Cart>('/cartorder/cart');
  return response.data;
};

export const addItemToCart = async (cartId: string, item: AddCartItemRequest): Promise<Cart> => {
  const response = await apiClient.post<Cart>(`/cartorder/cart/${cartId}/items`, item);
  return response.data;
};

export const updateCartItem = async (
  cartId: string,
  itemId: string,
  quantity: number
): Promise<Cart> => {
  const response = await apiClient.patch<Cart>(`/cartorder/cart/${cartId}/items/${itemId}`, {
    quantity,
  });
  return response.data;
};

export const removeCartItem = async (cartId: string, itemId: string): Promise<Cart> => {
  const response = await apiClient.delete<Cart>(`/cartorder/cart/${cartId}/items/${itemId}`);
  return response.data;
};

// Passer commande
interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface CreateOrderRequest {
  cartId: string;
  shippingAddress: ShippingAddress;
  notes?: string;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  amountXaf: string;
  items: CartItem[];
  createdAt: string;
  // Autres propriétés...
}

export const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
  const response = await apiClient.post<Order>('/cartorder/orders', orderData);
  return response.data;
};

export const getUserOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get<Order[]>('/cartorder/orders');
  return response.data;
};
```

### Marketing (Bannières)

```typescript
// services/marketing.service.ts
import apiClient from '../api/config';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export const getBanners = async (): Promise<Banner[]> => {
  const response = await apiClient.get<Banner[]>('/marketing/banners');
  return response.data;
};
```

## Gestion des Erreurs

L'API renvoie des erreurs standardisées avec les codes HTTP appropriés. Voici un exemple d'utilisation avec try/catch:

```typescript
import { AxiosError } from 'axios';

interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

// Dans un composant React
const fetchData = async () => {
  try {
    setLoading(true);
    const data = await getProducts({ category: 'smartphones' });
    setProducts(data.items);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      // Accéder aux détails de l'erreur API
      const apiError = error.response.data as ApiError;
      setError(Array.isArray(apiError.message) 
        ? apiError.message.join(', ') 
        : apiError.message);
    } else {
      setError('Une erreur inattendue s\'est produite');
    }
  } finally {
    setLoading(false);
  }
};
```

## Bonnes Pratiques

### 1. Organisation des Services API

Structurez vos services par domaine fonctionnel:
- `auth.service.ts` - Authentification et gestion des utilisateurs
- `catalog.service.ts` - Catalogue de produits
- `cart.service.ts` - Panier et commandes
- `marketing.service.ts` - Bannières et promotions
- etc.

### 2. Gestion d'État

Utilisez une solution de gestion d'état comme Redux, MobX ou Context API pour:
- Stocker les données récupérées de l'API
- Gérer l'état d'authentification
- Gérer l'état du panier

Exemple avec React Context + hooks:

```typescript
// contexts/CartContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getCurrentCart, addItemToCart, updateCartItem, removeCartItem } from '../services/cart.service';

// Définition du contexte, reducer, et provider...

// Hook personnalisé pour utiliser le panier
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Utilisation dans un composant
const ProductDetail = ({ product }) => {
  const { cart, addItem, isLoading } = useCart();
  
  const handleAddToCart = async () => {
    await addItem({
      productId: product.id,
      quantity: 1,
      unitPrice: product.price
    });
  };
  
  // Rendu du composant...
};
```

### 3. Gestion des Formulaires

Utilisez une bibliothèque comme Formik ou React Hook Form pour gérer efficacement les formulaires:

```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { login } from '../services/auth.service';

// Schéma de validation
const loginSchema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().required('Mot de passe requis')
});

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema)
  });
  
  const onSubmit = async (data) => {
    try {
      await login(data);
      // Redirection après connexion
    } catch (error) {
      // Gestion des erreurs
    }
  };
  
  // Rendu du formulaire...
};
```

## Exemples Pratiques

### Exemple 1: Page de Catalogue avec Filtres

```typescript
import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/catalog.service';

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priceMin: undefined,
    priceMax: undefined,
    search: '',
    page: 1,
    limit: 12
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts(filters);
        setProducts(response.items);
      } catch (error) {
        setError('Erreur lors du chargement des produits');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [filters]);
  
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      // Réinitialiser la pagination lors du changement de filtres
      page: name !== 'page' ? 1 : value
    }));
  };
  
  // Rendu de l'interface utilisateur...
};
```

### Exemple 2: Processus de Commande

```typescript
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { createOrder } from '../services/cart.service';

const CheckoutPage = () => {
  const { cart } = useCart();
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Cameroon',
    phone: ''
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const orderData = {
        cartId: cart.id,
        shippingAddress,
        notes
      };
      
      const order = await createOrder(orderData);
      
      // Rediriger vers la page de confirmation
      window.location.href = `/order-confirmation/${order.id}`;
      
    } catch (error) {
      setError('Erreur lors de la création de la commande');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Rendu du formulaire de commande...
};
```

## Outils Recommandés

Pour une meilleure expérience de développement frontend avec l'API Xeption E-commerce:

### 1. Génération de Types à partir de l'API

Utilisez le fichier OpenAPI généré pour créer automatiquement des types TypeScript:

```bash
# Installation
npm install -g openapi-typescript-codegen

# Génération
openapi -i http://localhost:3000/api-docs-json -o src/api-client
```

### 2. Outils de Test d'API

- **Postman**: Pour tester les endpoints manuellement
- **Insomnia**: Alternative à Postman avec une interface épurée
- **REST Client**: Extension VS Code pour tester les API directement depuis l'éditeur

### 3. Outils de Débogage

- **React Developer Tools**: Extension Chrome/Firefox pour déboguer les composants React
- **Redux DevTools**: Pour surveiller l'état global (si vous utilisez Redux)
- **Axios Logger**: Pour journaliser les requêtes/réponses API

```typescript
// Configurer un logger pour Axios
import axios from 'axios';

// Intercepteur de requête
axios.interceptors.request.use(request => {
  console.log('API Request:', request);
  return request;
});

// Intercepteur de réponse
axios.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);
```

## Conclusion

Ce guide fournit les bases pour interagir efficacement avec l'API Xeption E-commerce. N'hésitez pas à consulter la documentation OpenAPI complète à l'adresse `http://localhost:3000/api-docs` pour des informations détaillées sur tous les endpoints disponibles.

Pour toute question ou problème concernant l'intégration avec le backend, veuillez contacter l'équipe de développement backend à l'adresse `dev-backend@xeption.com`.