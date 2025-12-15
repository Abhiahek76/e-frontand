import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShopPage from "./pages/shopPage";
import HomePage from "./pages/Homepage";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import NotFound from "./pages/Notfount";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
