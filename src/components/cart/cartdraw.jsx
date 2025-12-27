import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  selectCartItems,
  selectCartSubtotal,
  selectCartLoading,
} from "../../store/cartSlice";

function formatMoney(amount, currency = "INR", locale = "en-IN") {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export default function CartDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();

  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const loading = useSelector(selectCartLoading);

  useEffect(() => {
    if (isOpen) dispatch(fetchCart());
  }, [isOpen, dispatch]);

  const { totalItems } = useMemo(() => {
    const totalItems = (items || []).reduce(
      (sum, it) => sum + (it.quantity || 0),
      0
    );
    return { totalItems };
  }, [items]);

  const getProduct = (item) => item?.variantId?.productId;

  const getImage = (item) => {
    const product = getProduct(item);
    const imgObj =
      Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : null;
    const url = typeof imgObj === "string" ? imgObj : imgObj?.url;
    return url || "https://via.placeholder.com/600x800?text=No+Image";
  };

  const getProductName = (item) => getProduct(item)?.name || "Item";

  const getVariantTitle = (item) => {
    const t = item?.title || item?.variantId?.title || "";
    if (!t) return "";
    if (String(t).trim().toLowerCase() === "default") return "";
    return t;
  };

  const getSlug = (item) => getProduct(item)?.slug;

  const getUnitPrice = (item) =>
    item?.unitPrice?.amount ?? item?.variantId?.price?.amount ?? 0;

  const getCurrency = (item) =>
    item?.unitPrice?.currency ?? item?.variantId?.price?.currency ?? "INR";

  const getOptionsText = (item) => {
    const options = item?.options || item?.variantId?.options || [];
    if (!Array.isArray(options) || options.length === 0) return "";
    return options.map((op) => `${op.name}: ${op.value}`).join(" • ");
  };

  const onDec = (item) => {
    const nextQty = (item.quantity || 0) - 1;
    if (nextQty <= 0) dispatch(removeCartItem({ itemId: item._id }));
    else dispatch(updateCartItem({ itemId: item._id, quantity: nextQty }));
  };

  const onInc = (item) => {
    const nextQty = (item.quantity || 0) + 1;
    dispatch(updateCartItem({ itemId: item._id, quantity: nextQty }));
  };

  const onRemove = (item) => {
    dispatch(removeCartItem({ itemId: item._id }));
  };

  const backdropClass =
    "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 " +
    (isOpen ? "opacity-100" : "opacity-0 pointer-events-none");

  const drawerClass =
    "fixed right-0 top-0 z-50 h-full w-full max-w-md transform transition-transform duration-300 ease-out " +
    "bg-background shadow-2xl " +
    (isOpen ? "translate-x-0" : "translate-x-full");

  return (
    <>
      {/* Backdrop */}
      <div className={backdropClass} onClick={onClose} />

      {/* Drawer */}
      <aside
        className={drawerClass}
        role="dialog"
        aria-modal="true"
        aria-label="Cart drawer"
      >
        <div className="flex flex-col h-full">
          {/* Header (sticky) */}
          <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border">
            <div className="flex items-center justify-between px-4 py-4 lg:px-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Cart</h2>
                <p className="text-xs text-muted-foreground">
                  {totalItems} item{totalItems === 1 ? "" : "s"}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close cart"
                title="Close"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6">
            {loading && (!items || items.length === 0) ? (
              <div className="space-y-4">
                {[1, 2, 3].map((k) => (
                  <div key={k} className="flex gap-4 animate-pulse">
                    <div className="w-20 rounded-xl bg-muted aspect-[4/5]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-4 w-1/2 bg-muted rounded" />
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-8 w-40 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !items || items.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold text-foreground">
                  Your cart is empty
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  Add products to see them here.
                </p>

                <Link
                  to="/shop"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
                >
                  Start shopping <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => {
                  const slug = getSlug(item);
                  const productLink = slug ? `/product/${slug}` : "#";
                  const unit = getUnitPrice(item);
                  const currency = getCurrency(item);
                  const optionsText = getOptionsText(item);
                  const productName = getProductName(item);
                  const variantTitle = getVariantTitle(item);

                  return (
                    <li
                      key={item._id}
                      className="rounded-2xl bg-card shadow-sm p-3 lg:p-4"
                    >
                      <div className="flex gap-4">
                        <Link
                          to={productLink}
                          onClick={onClose}
                          className="w-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 aspect-[4/5]"
                          aria-label={productName}
                        >
                          <img
                            src={getImage(item)}
                            alt={productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/600x800?text=No+Image";
                            }}
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            to={productLink}
                            onClick={onClose}
                            className="font-medium text-foreground hover:underline line-clamp-1"
                          >
                            {productName}
                          </Link>

                          {variantTitle ? (
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                              {variantTitle}
                            </p>
                          ) : null}

                          {optionsText ? (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {optionsText}
                            </p>
                          ) : null}

                          <div className="flex items-center justify-between mt-2">
                            <p className="font-semibold text-foreground">
                              {formatMoney(unit, currency)}
                            </p>

                            <button
                              onClick={() => onRemove(item)}
                              disabled={loading}
                              className="text-xs text-muted-foreground hover:text-destructive transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            {/* Qty control */}
                            <div className="inline-flex items-center rounded-lg bg-muted">
                              <button
                                onClick={() => onDec(item)}
                                disabled={loading}
                                className="p-2 rounded-l-lg hover:bg-muted/80 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                aria-label="Decrease quantity"
                                title="Decrease"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <span className="w-10 text-center text-sm font-medium text-foreground">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() => onInc(item)}
                                disabled={loading}
                                className="p-2 rounded-r-lg hover:bg-muted/80 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                                title="Increase"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Line total (nice touch) */}
                            <p className="text-sm text-muted-foreground">
                              {formatMoney(
                                Number(unit) * Number(item.quantity || 0),
                                currency
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer (sticky) */}
          {items && items.length > 0 && (
            <div className="sticky bottom-0 bg-background/90 backdrop-blur border-t border-border">
              <div className="px-4 py-4 lg:px-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {formatMoney(subtotal || 0, "INR")}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Shipping & taxes calculated at checkout.
                </p>

                <div className="grid gap-3">
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-center hover:opacity-90 transition"
                  >
                    Checkout
                  </Link>

                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="w-full py-3 rounded-lg bg-muted text-foreground font-medium text-center hover:bg-muted/80 transition"
                  >
                    View cart
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
