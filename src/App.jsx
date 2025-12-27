import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShopPage from "./pages/shoppage";
import CartPage from "./pages/cart";
import ProductDetailPage from "./pages/PruductDetaiPage";
import HomePage from "./pages/Homepage";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import CheckoutPage from "./pages/Chackout";
import NotFound from "./pages/Notfount";
import ProfilePage from "./pages/profile";
import ScrollToTop from "./pages/Scrolltop";
import ProtectedRoute from "./routers/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Protected Routes Group */}
        <Route element={<ProtectedRoute redirectTo="/login" />}>
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
