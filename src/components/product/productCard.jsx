import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
//import { addToCart, selectCartLoading } from "../../store/storSlice"; // path adjust
import { selectCartLoading, addToCart } from "../../store/cartSlice";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const cartLoading = useSelector(selectCartLoading);

  const discount = product?.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const firstImage =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : null;

  const imageSrc = firstImage?.url || product?.image || "";
  const imageAlt = firstImage?.alt || product?.name || "Product";

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const variantId =
      product?.defaultVariantId ||
      product?.variantId ||
      product?.firstVariantId;

    if (!variantId) {
      toast.error("VariantId missing");
      return;
    }

    toast.promise(dispatch(addToCart({ variantId, quantity: 1 })).unwrap(), {
      loading: "Adding to cart...",
      success: "Added to cart ",
      error: (err) =>
        err?.message || err?.error?.message || "Failed to add to cart",
    });
  };

  return (
    <Link to={`/product/${product?.slug}`} className="group block product-card">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/600x800?text=No+Image";
          }}
        />

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-destructive text-destructive-foreground rounded">
              -{discount}%
            </span>
          )}
          {product?.featured && (
            <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded">
              Featured
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={cartLoading}
            className="w-full py-2.5 bg-background/95 backdrop-blur-sm text-foreground text-sm font-medium rounded-md flex items-center justify-center gap-2 hover:bg-background transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartLoading ? "Adding..." : "Quick Add"}
          </button>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {product?.brandName || product?.brand || ""}
        </p>

        <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {product?.name || ""}
        </h3>

        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
          {product?.shortDescription || product?.description || ""}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              ${Number(product?.price || 0).toFixed(2)}
            </span>

            {product?.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="text-sm text-muted-foreground">
              {product?.rating ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
