import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import GlassHeader from "./components/layout/GlassHeader";
import { LocationProvider } from "./context/LocationContext";

// Lazy load components for better performance
const ProductListing = lazy(
  () => import("./components/product/ProductListing"),
);
const ProductDetail = lazy(() => import("./components/product/ProductDetail"));
const CartPage = lazy(() => import("./components/cart/CartPage"));

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
const AddressesPage = lazy(() => import("./pages/account/AddressesPage"));

function App() {
  return (
    <LocationProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <GlassHeader />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/products/:category" element={<ProductListing />} />
            <Route
              path="/products/detail/:productId"
              element={<ProductDetail />}
            />
            <Route path="/cart" element={<CartPage />} />

            {/* Service Routes */}
            <Route path="/trade-in" element={<TradeInPage />} />
            <Route path="/business" element={<BusinessProcurementPage />} />
            <Route path="/consultation" element={<ConsultationPage />} />

            {/* Auth Routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />

            {/* Account Routes */}
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/account/orders" element={<OrdersPage />} />
            <Route path="/account/addresses" element={<AddressesPage />} />

            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </LocationProvider>
  );
}

export default App;
