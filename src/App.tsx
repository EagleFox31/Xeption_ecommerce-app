import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import GlassHeader from "./components/layout/GlassHeader";
import { LocationProvider } from "./context/LocationContext";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Lazy load components for better performance
const ProductListing = lazy(
  () => import("./components/product/ProductListing"),
);
const ProductDetail = lazy(() => import("./components/product/ProductDetail"));
const CartPage = lazy(() => import("./components/cart/CartPage"));
const CheckoutPage = lazy(() => import("./components/checkout/CheckoutPage"));

// Service pages
const TradeInPage = lazy(() => import("./pages/TradeInPage"));
const BusinessProcurementPage = lazy(
  () => import("./pages/BusinessProcurementPage"),
);
const ConsultationPage = lazy(() => import("./pages/ConsultationPage"));

// Auth pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));

// Account pages
const ProfilePage = lazy(() => import("./pages/account/ProfilePage"));
const OrdersPage = lazy(() => import("./pages/account/OrdersPage"));
const OrderDetailsPage = lazy(() => import("./pages/account/OrderDetailsPage"));
const AddressesPage = lazy(() => import("./pages/account/AddressesPage"));

// Business pages
const BusinessClientDashboard = lazy(
  () => import("./components/business/BusinessClientDashboard"),
);

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <LocationProvider>
          <Suspense fallback={<p>Loading...</p>}>
            <>
              <GlassHeader />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductListing />} />
                <Route path="/products/:category" element={<ProductListing />} />
                <Route
                  path="/products/detail/:productId"
                  element={<ProductDetail />}
                />
                <Route path="/cart" element={<CartPage />} />
                
                {/* Auth Routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />

                {/* Service Routes */}
                <Route path="/trade-in" element={<TradeInPage />} />
                <Route path="/business" element={<BusinessProcurementPage />} />
                <Route path="/consultation" element={<ConsultationPage />} />

                {/* Protected Account Routes */}
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/addresses"
                  element={
                    <ProtectedRoute>
                      <AddressesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Order Routes */}
                <Route
                  path="/account/orders/:orderId"
                  element={
                    <ProtectedRoute>
                      <OrderDetailsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Business Routes */}
                <Route
                  path="/business/dashboard"
                  element={
                    <ProtectedRoute requiredRoles={["business"]}>
                      <BusinessClientDashboard />
                    </ProtectedRoute>
                  }
                />

                {import.meta.env.VITE_TEMPO === "true" && (
                  <Route path="/tempobook/*" />
                )}
              </Routes>
              {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
            </>
          </Suspense>
        </LocationProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
