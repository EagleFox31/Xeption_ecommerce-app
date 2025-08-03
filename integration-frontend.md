# Intégration Frontend-Backend pour Xeption E-commerce

## Sommaire
1. [Introduction](#introduction)
2. [Configuration du Client API](#configuration-du-client-api)
3. [Connecter le Frontend React aux APIs Backend](#connecter-le-frontend-react-aux-apis-backend)
4. [Authentification JWT End-to-End](#authentification-jwt-end-to-end)
5. [Validation des Flux Utilisateur](#validation-des-flux-utilisateur)
6. [Optimisation des Appels API](#optimisation-des-appels-api)
7. [Tests et Débogage](#tests-et-débogage)
8. [Déploiement et Environnements](#déploiement-et-environnements)

## Introduction

L'intégration entre le frontend React et le backend NestJS est une étape cruciale dans le développement de l'application Xeption E-commerce. Ce document fournit un guide détaillé pour connecter efficacement ces deux parties, tester les flux utilisateur, et optimiser les performances.

## Configuration du Client API

### Installation des Dépendances

```bash
# Installer Axios pour les requêtes HTTP
npm install axios

# Installer des bibliothèques utiles pour la gestion des requêtes
npm install react-query axios-hooks swr  # Choisir celle qui convient le mieux au projet
```

### Configuration du Client Axios

Créez un client Axios configuré pour communiquer avec l'API backend:

```typescript
// src/services/api-client.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Détecter l'environnement pour utiliser l'URL appropriée
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://api.xeption.com/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
};

// Créer l'instance Axios
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
});

// Intercepteur pour ajouter le token JWT à chaque requête
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Gérer les erreurs d'authentification (401)
    if (error.response?.status === 401) {
      // Vider le localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Rediriger vers la page de connexion
      window.location.href = '/auth/login';
    }
    
    // Gérer les erreurs de serveur (500)
    if (error.response?.status === 500) {
      console.error('Erreur serveur:', error);
      // Vous pourriez afficher une notification ou enregistrer l'erreur
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Configuration avec React Query

Pour une gestion plus efficace des requêtes, états de chargement et mise en cache, utilisez React Query:

```typescript
// src/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export const QueryProvider: React.FC = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
};
```

## Connecter le Frontend React aux APIs Backend

### Structure des Services API

Organisez vos services API par domaine fonctionnel:

```typescript
// src/services/auth.service.ts
import apiClient from './api-client';
import { LoginCredentials, AuthResponse, RegisterData, UserProfile } from '../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
  
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/auth/profile');
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
};
```

```typescript
// src/services/catalog.service.ts
import apiClient from './api-client';
import { ProductsResponse, Product, ProductFilters } from '../types/catalog';

export const catalogService = {
  getProducts: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const response = await apiClient.get<ProductsResponse>('/catalog/products', { 
      params: filters 
    });
    return response.data;
  },
  
  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/catalog/products/${id}`);
    return response.data;
  },
  
  // Autres méthodes...
};
```

### Hooks Personnalisés avec React Query

Créez des hooks personnalisés pour utiliser vos services API:

```typescript
// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { authService } from '../services/auth.service';
import { LoginCredentials, RegisterData } from '../types/auth';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Mutation pour la connexion
  const login = useMutation(
    (credentials: LoginCredentials) => authService.login(credentials),
    {
      onSuccess: (data) => {
        // Stocker le token et les données utilisateur
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        // Invalider les requêtes pour forcer un rafraîchissement
        queryClient.invalidateQueries('user');
        
        // Rediriger vers la page d'accueil
        navigate('/');
      },
    }
  );
  
  // Mutation pour l'inscription
  const register = useMutation(
    (data: RegisterData) => authService.register(data),
    {
      onSuccess: (data) => {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        queryClient.invalidateQueries('user');
        navigate('/');
      },
    }
  );
  
  // Requête pour récupérer le profil utilisateur
  const userProfile = useQuery(
    'user',
    () => authService.getProfile(),
    {
      // Ne pas exécuter si pas de token
      enabled: !!localStorage.getItem('auth_token'),
      retry: false,
    }
  );
  
  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    queryClient.clear();
    navigate('/auth/login');
  };
  
  return {
    login,
    register,
    userProfile,
    logout,
    isAuthenticated: !!localStorage.getItem('auth_token'),
  };
};
```

```typescript
// src/hooks/useCatalog.ts
import { useQuery } from 'react-query';
import { catalogService } from '../services/catalog.service';
import { ProductFilters } from '../types/catalog';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery(
    ['products', filters],
    () => catalogService.getProducts(filters),
    {
      keepPreviousData: true,
    }
  );
};

export const useProduct = (id: string) => {
  return useQuery(
    ['product', id],
    () => catalogService.getProductById(id),
    {
      enabled: !!id,
    }
  );
};
```

### Utilisation des Hooks dans les Composants

```tsx
// src/components/auth/LoginForm.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LoginCredentials } from '../../types/auth';

const loginSchema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().required('Mot de passe requis'),
});

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
  });
  
  const onSubmit = (data: LoginCredentials) => {
    login.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className={errors.email ? 'form-control is-invalid' : 'form-control'}
        />
        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          id="password"
          {...register('password')}
          className={errors.password ? 'form-control is-invalid' : 'form-control'}
        />
        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={login.isLoading}
      >
        {login.isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
      
      {login.isError && (
        <div className="alert alert-danger mt-3">
          {(login.error as any)?.response?.data?.message || 'Erreur de connexion'}
        </div>
      )}
    </form>
  );
};
```

```tsx
// src/components/product/ProductListing.tsx
import React, { useState } from 'react';
import { useProducts } from '../../hooks/useCatalog';
import { ProductCard } from './ProductCard';
import { ProductFilters } from '../../types/catalog';
import { Pagination } from '../common/Pagination';

export const ProductListing: React.FC = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
  });
  
  const { data, isLoading, isError } = useProducts(filters);
  
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  if (isLoading) return <div>Chargement des produits...</div>;
  if (isError) return <div>Erreur lors du chargement des produits</div>;
  
  return (
    <div>
      <div className="row">
        {data?.items.map(product => (
          <div key={product.id} className="col-md-4 mb-4">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      {data && (
        <Pagination
          currentPage={filters.page || 1}
          totalPages={Math.ceil(data.total / (filters.limit || 12))}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
```

## Authentification JWT End-to-End

### Flux d'Authentification Complet

Le flux d'authentification JWT comprend plusieurs étapes:

1. **Connexion utilisateur**:
   - L'utilisateur soumet ses identifiants
   - Le backend vérifie les identifiants et génère un JWT
   - Le frontend stocke le JWT dans localStorage

2. **Autorisation des requêtes**:
   - Le JWT est envoyé dans l'en-tête Authorization de chaque requête
   - Le backend valide le JWT et autorise l'accès

3. **Gestion des erreurs d'authentification**:
   - Intercepter les erreurs 401 (Unauthorized)
   - Rediriger vers la page de connexion

4. **Déconnexion**:
   - Supprimer le JWT du localStorage
   - Rediriger vers la page de connexion

### Implémentation du Contexte d'Authentification

```tsx
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const auth = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    if (auth.userProfile.data) {
      setUser(auth.userProfile.data);
    }
  }, [auth.userProfile.data]);
  
  const value = {
    isAuthenticated: auth.isAuthenticated,
    user,
    isLoading: auth.userProfile.isLoading,
    login: async (email: string, password: string) => {
      await auth.login.mutateAsync({ email, password });
    },
    register: async (data: any) => {
      await auth.register.mutateAsync(data);
    },
    logout: auth.logout,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
```

### Composant de Protection des Routes

```tsx
// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const location = useLocation();
  
  // Afficher un indicateur de chargement pendant la vérification
  if (isLoading) {
    return <div>Vérification de l'authentification...</div>;
  }
  
  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // Vérifier les rôles si nécessaire
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      return <Navigate to="/forbidden" replace />;
    }
  }
  
  // Autoriser l'accès
  return <>{children}</>;
};
```

### Utilisation dans les Routes

```tsx
// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProfilePage } from './pages/account/ProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

const App: React.FC = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            
            {/* Routes protégées */}
            <Route 
              path="/account/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Routes protégées avec rôles */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
};

export default App;
```

## Validation des Flux Utilisateur

### Flux Principaux à Tester

1. **Flux d'Inscription et Connexion**
2. **Flux de Navigation Catalogue**
3. **Flux de Gestion du Panier**
4. **Flux de Commande**
5. **Flux de Gestion du Compte**

### Test du Flux d'Inscription et Connexion

1. **Création de compte**:
   - Remplir le formulaire d'inscription
   - Soumettre le formulaire
   - Vérifier la redirection
   - Vérifier que le token JWT est stocké

2. **Connexion**:
   - Remplir le formulaire de connexion
   - Soumettre le formulaire
   - Vérifier la redirection
   - Vérifier que le token JWT est stocké

3. **Accès aux routes protégées**:
   - Naviguer vers une route protégée
   - Vérifier l'accès autorisé avec un token valide
   - Vérifier la redirection vers la page de connexion sans token

4. **Déconnexion**:
   - Cliquer sur le bouton de déconnexion
   - Vérifier la suppression du token
   - Vérifier la redirection vers la page de connexion

### Test du Flux de Commande

1. **Ajout au panier**:
   - Naviguer vers la page produit
   - Ajouter le produit au panier
   - Vérifier la mise à jour du panier

2. **Modification du panier**:
   - Modifier la quantité
   - Supprimer un article
   - Vérifier les calculs de total

3. **Processus de commande**:
   - Passer à la caisse
   - Remplir les informations de livraison
   - Choisir un mode de paiement
   - Confirmer la commande
   - Vérifier la confirmation de commande

### Outils de Test E2E

Pour tester ces flux de manière automatisée, utilisez des outils comme:

1. **Cypress**:
   ```bash
   npm install cypress --save-dev
   ```

2. **Exemple de test Cypress pour l'authentification**:
   ```javascript
   // cypress/integration/auth.spec.js
   describe('Authentication Flow', () => {
     beforeEach(() => {
       // Nettoyer localStorage avant chaque test
       cy.clearLocalStorage();
     });
     
     it('should allow user to register', () => {
       cy.visit('/auth/register');
       
       // Générer un email unique
       const email = `test-${Date.now()}@example.com`;
       
       cy.get('#firstName').type('Test');
       cy.get('#lastName').type('User');
       cy.get('#email').type(email);
       cy.get('#password').type('Password123!');
       cy.get('#confirmPassword').type('Password123!');
       
       cy.get('form').submit();
       
       // Vérifier la redirection
       cy.url().should('eq', Cypress.config().baseUrl + '/');
       
       // Vérifier le stockage du token
       cy.window().then((window) => {
         expect(window.localStorage.getItem('auth_token')).to.exist;
       });
     });
     
     it('should allow user to login', () => {
       cy.visit('/auth/login');
       
       cy.get('#email').type('user@example.com');
       cy.get('#password').type('Password123!');
       
       cy.get('form').submit();
       
       // Vérifier la redirection
       cy.url().should('eq', Cypress.config().baseUrl + '/');
       
       // Vérifier le stockage du token
       cy.window().then((window) => {
         expect(window.localStorage.getItem('auth_token')).to.exist;
       });
     });
     
     it('should redirect to login when accessing protected route without auth', () => {
       cy.visit('/account/profile');
       
       // Vérifier la redirection
       cy.url().should('include', '/auth/login');
     });
     
     it('should allow access to protected route when authenticated', () => {
       // Login programmatically
       cy.request('POST', '/api/auth/login', {
         email: 'user@example.com',
         password: 'Password123!',
       }).then((response) => {
         // Stocker le token
         localStorage.setItem('auth_token', response.body.access_token);
         
         // Visiter la route protégée
         cy.visit('/account/profile');
         
         // Vérifier l'accès
         cy.url().should('include', '/account/profile');
       });
     });
   });
   ```

## Optimisation des Appels API

### Techniques de Mise en Cache

1. **Mise en cache avec React Query**:
   ```typescript
   // Configuration avec staleTime pour réduire les requêtes
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000, // 5 minutes
         cacheTime: 10 * 60 * 1000, // 10 minutes
       },
     },
   });
   ```

2. **Préchargement des données**:
   ```typescript
   // Précharger les catégories fréquemment utilisées
   queryClient.prefetchQuery(['categories'], () => 
     catalogService.getCategories()
   );
   ```

3. **Invalidation sélective du cache**:
   ```typescript
   // Après avoir ajouté un article au panier
   addToCart.mutate(cartItem, {
     onSuccess: () => {
       // Invalider uniquement la requête du panier
       queryClient.invalidateQueries(['cart']);
     },
   });
   ```

### Optimisation des Requêtes

1. **Sélection des champs**:
   ```typescript
   // Spécifier les champs nécessaires dans les paramètres de requête
   const getProductsLight = async () => {
     const response = await apiClient.get('/catalog/products', {
       params: {
         fields: 'id,name,price,thumbnail',
       },
     });
     return response.data;
   };
   ```

2. **Pagination efficace**:
   ```typescript
   const useInfiniteProducts = (filters) => {
     return useInfiniteQuery(
       ['products', filters],
       ({ pageParam = 1 }) => 
         catalogService.getProducts({ ...filters, page: pageParam }),
       {
         getNextPageParam: (lastPage) => {
           const hasMore = lastPage.page * lastPage.limit < lastPage.total;
           return hasMore ? lastPage.page + 1 : undefined;
         },
       }
     );
   };
   ```

3. **Utilisation de l'API d'intersection pour le chargement à la demande**:
   ```tsx
   import { useInView } from 'react-intersection-observer';
   
   const ProductListInfinite = () => {
     const { ref, inView } = useInView();
     const { 
       data, 
       fetchNextPage, 
       hasNextPage, 
       isFetchingNextPage 
     } = useInfiniteProducts(filters);
     
     useEffect(() => {
       if (inView && hasNextPage) {
         fetchNextPage();
       }
     }, [inView, fetchNextPage, hasNextPage]);
     
     return (
       <div>
         {data?.pages.map(page => (
           page.items.map(product => (
             <ProductCard key={product.id} product={product} />
           ))
         ))}
         
         <div ref={ref}>{isFetchingNextPage ? 'Chargement...' : null}</div>
       </div>
     );
   };
   ```

### Réduction des Requêtes Redondantes

1. **Utilisation de debounce pour les recherches**:
   ```tsx
   import { useState, useEffect } from 'react';
   import { useDebounce } from 'use-debounce';
   
   const SearchProducts = () => {
     const [searchTerm, setSearchTerm] = useState('');
     const [debouncedTerm] = useDebounce(searchTerm, 500);
     
     const { data, isLoading } = useProducts({ 
       search: debouncedTerm,
       page: 1,
       limit: 10,
     });
     
     return (
       <div>
         <input
           type="text"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           placeholder="Rechercher des produits..."
         />
         
         {isLoading ? (
           <div>Chargement...</div>
         ) : (
           <div>
             {data?.items.map(product => (
               <ProductCard key={product.id} product={product} />
             ))}
           </div>
         )}
       </div>
     );
   };
   ```

2. **Batching des mises à jour avec React 18**:
   ```tsx
   // Utiliser createRoot de React 18 pour activer le batching automatique
   import { createRoot } from 'react-dom/client';
   import App from './App';
   
   const container = document.getElementById('root');
   const root = createRoot(container);
   root.render(<App />);
   ```

## Tests et Débogage

### Tests de l'Intégration API

1. **Tests unitaires avec Mock Service Worker**:
   ```bash
   npm install msw --save-dev
   ```

   ```typescript
   // src/mocks/handlers.ts
   import { rest } from 'msw';
   
   export const handlers = [
     rest.post('/api/auth/login', (req, res, ctx) => {
       const { email, password } = req.body;
       
       if (email === 'test@example.com' && password === 'password') {
         return res(
           ctx.status(200),
           ctx.json({
             access_token: 'fake-jwt-token',
             user: {
               id: '1',
               email: 'test@example.com',
               firstName: 'Test',
               lastName: 'User',
               role: 'USER',
             },
           }),
         );
       }
       
       return res(
         ctx.status(401),
         ctx.json({
           message: 'Invalid credentials',
         }),
       );
     }),
     
     rest.get('/api/auth/profile', (req, res, ctx) => {
       const auth = req.headers.get('Authorization');
       
       if (!auth || !auth.includes('Bearer fake-jwt-token')) {
         return res(
           ctx.status(401),
           ctx.json({
             message: 'Unauthorized',
           }),
         );
       }
       
       return res(
         ctx.status(200),
         ctx.json({
           id: '1',
           email: 'test@example.com',
           firstName: 'Test',
           lastName: 'User',
           role: 'USER',
         }),
       );
     }),
     
     // Autres endpoints...
   ];
   ```

2. **Tests unitaires des hooks personnalisés**:
   ```typescript
   // src/hooks/useAuth.test.tsx
   import { renderHook, act } from '@testing-library/react-hooks';
   import { QueryClientProvider, QueryClient } from 'react-query';
   import { useAuth } from './useAuth';
   import { authService } from '../services/auth.service';
   
   // Mock du service
   jest.mock('../services/auth.service');
   
   // Mock de react-router-dom
   const mockNavigate = jest.fn();
   jest.mock('react-router-dom', () => ({
     useNavigate: () => mockNavigate,
   }));
   
   describe('useAuth', () => {
     let queryClient;
     let wrapper;
     
     beforeEach(() => {
       queryClient = new QueryClient({
         defaultOptions: {
           queries: {
             retry: false,
           },
         },
       });
       
       wrapper = ({ children }) => (
         <QueryClientProvider client={queryClient}>
           {children}
         </QueryClientProvider>
       );
       
       // Reset mocks
       jest.clearAllMocks();
     });
     
     it('should handle login successfully', async () => {
       // Mock de la réponse login
       const mockUser = { id: '1', email: 'test@example.com' };
       const mockResponse = { 
         access_token: 'fake-token', 
         user: mockUser 
       };
       
       authService.login.mockResolvedValueOnce(mockResponse);
       
       // Rendre le hook
       const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
       
       // Exécuter la mutation
       act(() => {
         result.current.login.mutate({ 
           email: 'test@example.com', 
           password: 'password' 
         });
       });
       
       // Attendre la résolution
       await waitForNextUpdate();
       
       // Vérifications
       expect(authService.login).toHaveBeenCalledWith({
         email: 'test@example.com',
         password: 'password',
       });
       
       expect(localStorage.getItem('auth_token')).toBe('fake-token');
       expect(localStorage.getItem('user_data')).toBe(JSON.stringify(mockUser));
       expect(mockNavigate).toHaveBeenCalledWith('/');
     });
     
     // Autres tests...
   });
   ```

### Outils de Débogage

1. **React Developer Tools**:
   - Inspecter les composants React
   - Suivre les rendus et les mises à jour
   - Profiler les performances

2. **React Query Devtools**:
   ```tsx
   import { ReactQueryDevtools } from 'react-query/devtools';
   
   const App = () => {
     return (
       <QueryClientProvider client={queryClient}>
         {/* Votre application */}
         <ReactQueryDevtools initialIsOpen={false} />
       </QueryClientProvider>
     );
   };
   ```

3. **Network Monitor de Chrome**:
   - Suivre les requêtes HTTP
   - Analyser les temps de réponse
   - Identifier les goulots d'étranglement

## Déploiement et Environnements

### Configuration Multi-environnement

```typescript
// src/config/env.ts
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || (
    process.env.NODE_ENV === 'production'
      ? 'https://api.xeption.com/api'
      : process.env.NODE_ENV === 'staging'
        ? 'https://api-staging.xeption.com/api'
        : 'http://localhost:3000/api'
  ),
  
  storagePrefix: 'xeption_',
  
  // Autres configurations spécifiques à l'environnement
};
```

### Variables d'Environnement

Créez différents fichiers `.env` pour chaque environnement:

```
# .env.development
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_DEBUG=true

# .env.staging
REACT_APP_API_URL=https://api-staging.xeption.com/api
REACT_APP_DEBUG=true

# .env.production
REACT_APP_API_URL=https://api.xeption.com/api
REACT_APP_DEBUG=false
```

### Scripts de Déploiement

Dans `package.json`:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:staging": "env-cmd -f .env.staging react-scripts build",
    "build:prod": "env-cmd -f .env.production react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## Conclusion

L'intégration du frontend React avec le backend NestJS est une étape cruciale dans le développement de l'application Xeption E-commerce. En suivant les bonnes pratiques décrites dans ce document, vous pourrez créer une expérience utilisateur fluide, sécurisée et performante.

Points clés à retenir:
- Utilisez un client API bien configuré avec des intercepteurs pour gérer l'authentification
- Implémentez des hooks personnalisés avec React Query pour une gestion efficace des requêtes
- Testez rigoureusement les flux utilisateur end-to-end
- Optimisez les appels API avec des stratégies de mise en cache et de chargement à la demande
- Configurez correctement les environnements de développement, staging et production

En suivant ces directives, vous pourrez créer une application robuste qui offre une expérience utilisateur optimale tout en maintenant un code maintenable et évolutif.