import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { useState, useEffect, lazy, Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import AdminLayout from "@/components/AdminLayout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const AdminProducts = lazy(() => import("./pages/AdminProducts.tsx"));
const AdminCategories = lazy(() => import("./pages/AdminCategories.tsx"));
const AdminBanners = lazy(() => import("./pages/AdminBanners.tsx"));
const AdminOrders = lazy(() => import("./pages/AdminOrders.tsx"));
const AdminSettings = lazy(() => import("./pages/AdminSettings.tsx"));
const AdminReports = lazy(() => import("./pages/AdminReports.tsx"));
const AdminPayments = lazy(() => import("./pages/AdminPayments.tsx"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers.tsx"));
const AdminCustomKitItems = lazy(() => import("./pages/AdminCustomKitItems.tsx"));

const queryClient = new QueryClient();

const AppContent = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="custom-kit" element={<AdminCustomKitItems />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminAuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </CartProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
