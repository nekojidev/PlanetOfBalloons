import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Layout from "./components/layout/Layout"
import HomePage from "./pages/HomePage"
import ProductsPage from "./pages/ProductsPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrdersPage from "./pages/OrdersPage"
import OrderDetailPage from "./pages/OrderDetailPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ProfilePage from "./pages/ProfilePage"
import AnnouncementsPage from "./pages/AnnouncementsPage"
import PromotionsPage from "./pages/PromotionsPage"
import NotFoundPage from "./pages/NotFoundPage"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import AdminRoute from "./components/auth/AdminRoute"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminCategories from "./pages/admin/AdminCategories"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminAnnouncements from "./pages/admin/AdminAnnouncements"
import AdminPromotions from "./pages/admin/AdminPromotions"
import AdminContacts from "./pages/admin/AdminContacts"
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import Delivery from "./pages/Delivery"
import Contacts from "./pages/Contacts"
import About from "./pages/About"
import AnnouncementsDetailPage from "./pages/AnnouncementsDetailPage"
function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="planet-balloons-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="announcements/:id" element={<AnnouncementsDetailPage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="delivery" element={<Delivery/>} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="about" element={<About />} />
            <Route path="payment-success" element={<PaymentSuccessPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="payment-success" element={<PaymentSuccessPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="admin" element={<AdminRoute />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="promotions" element={<AdminPromotions />} />
              <Route path="contacts" element={<AdminContacts />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App

