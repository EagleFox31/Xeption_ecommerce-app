import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Détecter l'environnement pour utiliser l'URL appropriée
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return import.meta.env.VITE_API_URL || 'https://api.xeption.com/api/v1';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
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
  (config) => {
    const token = localStorage.getItem('xeption_auth_token');
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
      localStorage.removeItem('xeption_auth_token');
      localStorage.removeItem('xeption_user');
      
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