import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { cn } from "../../lib/util";
import useAuth from "../../hooks/useauth";

import { useDispatch, useSelector } from "react-redux";
import { fetchCart, selectCartItems } from "../../store/cartSlice";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar({ onCartClick = () => {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);

  // cartCount = total quantity
  const cartCount = (items || []).reduce(
    (sum, it) => sum + (it.quantity || 0),
    0
  );

  // Navbar load hobar sathe sathe cart fetch (so badge visible)
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <Link
            to="/"
            className="font-serif text-2xl lg:text-3xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
          >
            Lumière
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors link-underline"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <Link
              to={isAuthenticated ? "/profile" : "/login"}
              className="p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Account"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={onCartClick}
              className="relative p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-xs font-medium bg-primary text-primary-foreground rounded-full">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMenuOpen ? "max-h-64 pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
