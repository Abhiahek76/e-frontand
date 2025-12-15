import { useState } from "react";
import Navbar from "./Navber";
import Footer from "./Footer";
import CartDrawer from "../cart/cartdraw";
export default function MainLayout({ children }) {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar cartCount={0} onCartClick={() => setCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
