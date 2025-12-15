import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, RefreshCw, Sparkles } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import ProductCard from "../components/product/productCard";
import { products, categories } from "../data/product";
import HeroCarousel from "./Herosection";
const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
const features = [
  { icon: Truck, title: "Free Shipping", description: "On orders over $100" },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure checkout",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: Sparkles,
    title: "Premium Quality",
    description: "Curated with care",
  },
];

export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero */}
      <HeroCarousel />

      {/* Features Bar */}
      <section className="border-y border-border bg-card/50">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex items-center gap-4 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Explore our curated collections designed for every style and
              occasion.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                  <h3 className="text-xl lg:text-2xl font-serif font-semibold text-background mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-background/80">
                    {category.productCount} Products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24 bg-gradient-warm">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mb-4">
                Featured Products
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Handpicked favorites our customers love. Quality meets style in
                every piece.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 font-medium text-primary hover:gap-3 transition-all"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=600&fit=crop"
              alt="Store interior"
              className="w-full h-[400px] lg:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-foreground/60" />

            <div className="absolute inset-0 flex items-center justify-center text-center p-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl lg:text-5xl font-serif font-semibold text-background mb-4">
                  Join Our Community
                </h2>
                <p className="text-lg text-background/90 mb-8">
                  Subscribe to get exclusive access to new arrivals, special
                  offers, and style inspiration delivered straight to your
                  inbox.
                </p>

                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-md bg-background/95 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
