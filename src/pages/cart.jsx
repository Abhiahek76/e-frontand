import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import MainLayout from "../components/layout/MainLayout";
import { fetchCart, updateCartItem, removeCartItem } from "../store/cartSlice";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
const btnLg = "h-12 px-5";
const btnPrimary = "bg-primary text-primary-foreground hover:opacity-90";
const btnSecondary = "bg-muted text-foreground hover:bg-muted/80";
const btnGhost = "text-muted-foreground hover:text-foreground";

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

function clampImg(src) {
  return src || "https://via.placeholder.com/600x800?text=No+Image";
}

export default function CartPage() {
  const dispatch = useDispatch();

  const cart = useSelector((s) => s.cart?.cart);
  const loading = useSelector((s) => s.cart?.loading);
  const error = useSelector((s) => s.cart?.error);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const { items, totalItems, subtotal, currency } = useMemo(() => {
    const items = cart?.items || [];
    const totalItems = items.reduce((sum, it) => sum + (it.quantity || 0), 0);

    const computedSubtotal =
      cart?.computed?.subtotal ??
      items.reduce((sum, it) => {
        const unit = it?.unitPrice?.amount ?? it?.variantId?.price?.amount ?? 0;
        return sum + unit * (it.quantity || 0);
      }, 0);

    // use cart currency if exists; else first item's currency; else INR
    const cur =
      cart?.computed?.currency ||
      items?.[0]?.unitPrice?.currency ||
      items?.[0]?.variantId?.price?.currency ||
      "INR";

    return { items, totalItems, subtotal: computedSubtotal, currency: cur };
  }, [cart]);

  // Simple shipping rules (adjust as you need)
  const FREE_SHIPPING_THRESHOLD = 999; // ₹999 free shipping (common in India)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 79; // ₹79
  const tax = 0; // keep 0 unless you actually calculate GST
  const orderTotal = subtotal + shipping + tax;

  const freeLeft = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freePct = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  const onDec = (item) => {
    const nextQty = (item.quantity || 0) - 1;

    if (nextQty <= 0) {
      toast.promise(dispatch(removeCartItem({ itemId: item._id })).unwrap(), {
        loading: "Removing...",
        success: "Removed ",
        error: (e) => e?.message || "Failed to remove",
      });
      return;
    }

    toast.promise(
      dispatch(
        updateCartItem({ itemId: item._id, quantity: nextQty })
      ).unwrap(),
      {
        loading: "Updating...",
        success: "Updated ",
        error: (e) => e?.message || "Failed to update",
      }
    );
  };

  const onInc = (item) => {
    const nextQty = (item.quantity || 0) + 1;
    toast.promise(
      dispatch(
        updateCartItem({ itemId: item._id, quantity: nextQty })
      ).unwrap(),
      {
        loading: "Updating...",
        success: "Updated ",
        error: (e) => e?.message || "Failed to update",
      }
    );
  };

  const onRemove = (item) => {
    toast.promise(dispatch(removeCartItem({ itemId: item._id })).unwrap(), {
      loading: "Removing...",
      success: "Removed ",
      error: (e) => e?.message || "Failed to remove",
    });
  };

  // Empty
  if (!loading && items.length === 0) {
    return (
      <MainLayout>
        <div className="container-custom py-16 lg:py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-serif font-semibold text-foreground mb-3">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Add products to your cart to see them here.
            </p>

            <Link to="/shop" className={`${btnBase} ${btnLg} ${btnPrimary}`}>
              Start Shopping
            </Link>

            <div className="mt-8 flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Secure payments
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Truck className="w-4 h-4" /> Fast delivery
              </span>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-8 lg:py-12">
        {/* Top */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link to="/shop" className={cnBtn(btnBase, btnGhost)}>
            <ArrowLeft className="w-4 h-4" />
            Continue shopping
          </Link>

          <div className="text-right">
            <div className="text-sm text-muted-foreground">Subtotal</div>
            <div className="text-lg font-semibold text-foreground">
              {formatMoney(subtotal, currency)}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 mb-6">
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground">
            Shopping Cart
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        {loading && (
          <p className="text-muted-foreground mb-6">Loading cart...</p>
        )}
        {!loading && error && <p className="text-destructive mb-6">{error}</p>}

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free shipping banner */}
            <div className="rounded-2xl bg-muted/50 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-foreground">
                  {shipping === 0 ? (
                    <span className="font-medium">You have free shipping</span>
                  ) : (
                    <>
                      Add{" "}
                      <span className="font-semibold">
                        {formatMoney(freeLeft, currency)}
                      </span>{" "}
                      more for free shipping
                    </>
                  )}
                </p>
                <span className="text-xs text-muted-foreground">
                  {freePct}%
                </span>
              </div>

              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${freePct}%` }}
                />
              </div>
            </div>

            {items.map((item) => {
              const variant = item?.variantId;
              const prod = variant?.productId;

              const name = prod?.name || variant?.title || "Product";
              const slug = prod?.slug;
              const img =
                prod?.images?.[0]?.url || variant?.images?.[0]?.url || "";

              const brand = prod?.brandName || prod?.brandId?.name || "";
              const unit =
                item?.unitPrice?.amount ?? variant?.price?.amount ?? 0;
              const cur =
                item?.unitPrice?.currency ??
                variant?.price?.currency ??
                currency;

              const lineTotal = unit * (item.quantity || 0);

              const optionsText =
                Array.isArray(item?.options) && item.options.length > 0
                  ? item.options
                      .map((op) => `${op.name}: ${op.value}`)
                      .join(" • ")
                  : "";

              return (
                <div
                  key={item._id}
                  className="bg-card rounded-2xl shadow-sm p-4 lg:p-5"
                >
                  <div className="flex gap-4 lg:gap-5">
                    <Link
                      to={slug ? `/product/${slug}` : "#"}
                      className="w-24 lg:w-28 rounded-xl overflow-hidden bg-muted flex-shrink-0 aspect-[4/5]"
                      aria-label={name}
                    >
                      <img
                        src={clampImg(img)}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/600x800?text=No+Image";
                        }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to={slug ? `/product/${slug}` : "#"}
                            className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {name}
                          </Link>

                          {brand ? (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {brand}
                            </p>
                          ) : null}

                          {optionsText ? (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {optionsText}
                            </p>
                          ) : null}
                        </div>

                        <button
                          onClick={() => onRemove(item)}
                          disabled={loading}
                          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive disabled:opacity-60"
                          aria-label="Remove item"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        {/* Qty control - pill */}
                        <div className="inline-flex items-center rounded-xl bg-muted">
                          <button
                            onClick={() => onDec(item)}
                            disabled={loading}
                            className="p-2 rounded-l-xl hover:bg-muted/80 transition-colors disabled:opacity-60"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <span className="w-10 text-center text-sm font-semibold text-foreground">
                            {item.quantity || 0}
                          </span>

                          <button
                            onClick={() => onInc(item)}
                            disabled={loading}
                            className="p-2 rounded-r-xl hover:bg-muted/80 transition-colors disabled:opacity-60"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Prices */}
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatMoney(lineTotal, cur)}
                          </p>
                          {(item.quantity || 0) > 1 ? (
                            <p className="text-xs text-muted-foreground">
                              {formatMoney(unit, cur)} each
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-5">
                Order summary
              </h2>

              <div className="space-y-3">
                <Row label="Subtotal" value={formatMoney(subtotal, currency)} />
                <Row
                  label="Shipping"
                  value={
                    shipping === 0 ? "Free" : formatMoney(shipping, currency)
                  }
                />
                <Row
                  label="Tax"
                  value={tax === 0 ? "—" : formatMoney(tax, currency)}
                />

                <div className="h-px bg-muted my-2" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-foreground">
                    {formatMoney(orderTotal, currency)}
                  </span>
                </div>

                {shipping > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Add {formatMoney(freeLeft, currency)} more to get free
                    shipping.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Free shipping applied.
                  </p>
                )}
              </div>

              <Link
                to="/checkout"
                className={`${btnBase} ${btnLg} ${btnPrimary} w-full mt-6`}
              >
                Proceed to checkout
              </Link>

              <Link
                to="/shop"
                className={`${btnBase} ${btnLg} ${btnSecondary} w-full mt-3`}
              >
                Continue shopping
              </Link>

              <div className="mt-6 grid gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Secure checkout
                </span>
                <span className="inline-flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Fast delivery (India)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

/** helpers */
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

// small helper to avoid importing cn just for one line
function cnBtn(...classes) {
  return classes.filter(Boolean).join(" ");
}
