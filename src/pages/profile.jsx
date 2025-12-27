import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import useAuth from "../hooks/useauth"; //redux hook
import { toast } from "react-hot-toast";

const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    status: "Delivered",
    total: 189.0,
    items: 2,
  },
  {
    id: "ORD-002",
    date: "2024-01-10",
    status: "Processing",
    total: 299.0,
    items: 1,
  },
  {
    id: "ORD-003",
    date: "2024-01-05",
    status: "Delivered",
    total: 79.0,
    items: 3,
  },
];

const menuItems = [
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Package, label: "Orders", href: "/profile/orders" },
  { icon: Heart, label: "Wishlist", href: "/profile/wishlist" },
  { icon: Settings, label: "Settings", href: "/profile/settings" },
];

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container-custom py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Please sign in</h1>

          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium
                       bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Sign In
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-8 lg:py-12">
        <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mb-8">
          My Account
        </h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {/* Menu */}
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Profile Information
                </h2>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium
                             border border-border bg-background hover:bg-muted transition"
                >
                  Edit
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Full Name
                  </p>
                  <p className="font-medium text-foreground">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium text-foreground">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium text-foreground">Not provided</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Member Since
                  </p>
                  <p className="font-medium text-foreground">January 2026</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Recent Orders
                </h2>
                <Link
                  to="/profile/orders"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.date} • {order.items} items
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        ${Number(order.total).toFixed(2)}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          order.status === "Delivered"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Saved Addresses
                </h2>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium
                             border border-border bg-background hover:bg-muted transition"
                >
                  Add New
                </button>
              </div>

              <div className="text-center py-8 text-muted-foreground">
                <p>No saved addresses yet.</p>
                <p className="text-sm mt-1">
                  Add an address during checkout to save it here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
