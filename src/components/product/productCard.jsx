import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
export default function ProductCard({ product }) {
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // TODO: later you will connect redux/backend here
    console.log("Quick Add:", product.id);
  };

  return (
    <Link to={`/product/${product.id}`} className="group block product-card">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-destructive text-destructive-foreground rounded">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded">
              Featured
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full py-2.5 bg-background/95 backdrop-blur-sm text-foreground text-sm font-medium rounded-md flex items-center justify-center gap-2 hover:bg-background transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {product.brand}
        </p>

        <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
          {product.shortDescription}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="text-sm text-muted-foreground">
              {product.rating}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
