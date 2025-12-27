import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Star,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import ProductCard from "../components/product/productCard";
import { cn } from "../lib/util";

import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductBySlugThunk,
  fetchReviewsBySlugThunk,
  fetchProductsThunk,
} from "../store/storSlice";

import { addToCart, selectCartLoading } from "../store/cartSlice";

const tabs = ["Description", "Specifications", "Reviews"];

/** Simple Card components  */
function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-xl bg-background shadow-sm", className)}
      {...props}
    />
  );
}
function CardHeader({ className, ...props }) {
  return <div className={cn("p-6 pb-0", className)} {...props} />;
}
function CardContent({ className, ...props }) {
  return <div className={cn("p-6", className)} {...props} />;
}

/** Plain button styles */
const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
const btnLg = "h-12 px-5";
const btnPrimary = "bg-primary text-primary-foreground hover:opacity-90";
const btnSecondary = "bg-muted text-foreground hover:bg-muted/80";
const btnOutline = "hover:bg-muted"; // removed border

function ProductSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
      <div className="rounded-xl bg-background shadow-sm p-6">
        <div className="aspect-[4/5] lg:aspect-square max-h-[520px] lg:max-h-[640px] rounded-xl bg-muted" />
        <div className="flex gap-3 mt-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-16 h-20 lg:w-20 lg:h-24 rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-background shadow-sm p-6 space-y-4">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-10 w-3/4 bg-muted rounded" />
        <div className="h-5 w-52 bg-muted rounded" />
        <div className="h-8 w-40 bg-muted rounded" />
        <div className="h-20 w-full bg-muted rounded" />
        <div className="h-12 w-full bg-muted rounded" />
        <div className="h-12 w-full bg-muted rounded" />
      </div>
    </div>
  );
}

function formatMoney(value, currency = "INR", locale = "en-IN") {
  const num = Number(value || 0);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2)}`;
  }
}

function RatingStars({ value = 0, className = "" }) {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label={`Rating ${v} out of 5`}
    >
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i < Math.floor(v) ? "fill-warning text-warning" : "text-muted"
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { product, productLoading, reviewsBySlug, products } = useSelector(
    (s) => s.store
  );
  const cartLoading = useSelector(selectCartLoading);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(undefined);
  const [selectedColor, setSelectedColor] = useState(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");

  useEffect(() => {
    if (!slug) return;
    dispatch(fetchProductBySlugThunk(slug));
    dispatch(fetchReviewsBySlugThunk({ slug, page: 1, limit: 10 }));
  }, [dispatch, slug]);

  useEffect(() => {
    if (!product) return;

    setSelectedImage(0);
    setQuantity(1);

    setSelectedSize(
      Array.isArray(product?.sizes) && product.sizes.length
        ? product.sizes[0]
        : undefined
    );

    const firstColor =
      Array.isArray(product?.colors) && product.colors.length > 0
        ? product.colors[0]?.name
        : undefined;
    setSelectedColor(firstColor);
  }, [product]);

  useEffect(() => {
    if (!product?.categoryKey) return;
    dispatch(
      fetchProductsThunk({
        category: product.categoryKey,
        sort: "newest",
        page: 1,
        limit: 8,
      })
    );
  }, [dispatch, product?.categoryKey]);

  const images = useMemo(() => {
    if (!product?.images) return [];
    if (Array.isArray(product.images)) {
      return product.images
        .map((img) => (typeof img === "string" ? img : img?.url))
        .filter(Boolean);
    }
    return [];
  }, [product]);

  const imageAlt = product?.name || "Product";

  const productReviews = useMemo(() => {
    const entry = reviewsBySlug?.[slug];
    return entry?.items || [];
  }, [reviewsBySlug, slug]);

  const relatedProducts = useMemo(() => {
    const list = products || [];
    return list.filter((p) => p?.slug && p.slug !== product?.slug).slice(0, 4);
  }, [products, product?.slug]);

  // Variant logic
  const selectedVariant = useMemo(() => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    if (!variants.length) return null;

    const match = variants.find((v) => {
      const sizeOk = selectedSize ? v?.size === selectedSize : true;
      const colorValue = v?.colorName ?? v?.color ?? v?.color?.name;
      const colorOk = selectedColor ? colorValue === selectedColor : true;
      return sizeOk && colorOk;
    });

    const byDefaultId = variants.find(
      (v) => v?._id === product?.defaultVariantId
    );

    return match || byDefaultId || variants[0];
  }, [product, selectedSize, selectedColor]);

  const variantId = selectedVariant?._id || product?.defaultVariantId;

  const stockAvailable = useMemo(() => {
    const vStock = selectedVariant?.stock;
    if (typeof vStock === "number") return vStock;
    const pStock = product?.stock;
    if (typeof pStock === "number") return pStock;
    return null;
  }, [selectedVariant, product]);

  const isOutOfStock = stockAvailable === 0;

  const maxQty = useMemo(() => {
    if (typeof stockAvailable === "number") return Math.max(1, stockAvailable);
    return 99;
  }, [stockAvailable]);

  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(1, q), maxQty));
  }, [maxQty]);

  // ✅ Force USD + US locale (only change requested)
  const currency = "USD";
  const locale = "en-US";

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayOriginalPrice =
    selectedVariant?.originalPrice ?? product?.originalPrice ?? null;

  const discountPct = useMemo(() => {
    const p = Number(displayPrice || 0);
    const o = Number(displayOriginalPrice || 0);
    if (!o || o <= p) return null;
    return Math.round((1 - p / o) * 100);
  }, [displayPrice, displayOriginalPrice]);

  const nextImage = useCallback(() => {
    if (!images.length) return;
    setSelectedImage((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (!images.length) return;
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleAddToCart = useCallback(() => {
    if (!variantId) {
      toast.error("Variant not found");
      return;
    }
    if (isOutOfStock) {
      toast.error("Out of stock");
      return;
    }

    toast.promise(dispatch(addToCart({ variantId, quantity })).unwrap(), {
      loading: "Adding to cart...",
      success: "Added to cart ",
      error: (err) => err?.message || "Failed to add to cart",
    });
  }, [dispatch, variantId, quantity, isOutOfStock]);

  const handleBuyNow = useCallback(async () => {
    if (!variantId) {
      toast.error("Variant not found");
      return;
    }
    if (isOutOfStock) {
      toast.error("Out of stock");
      return;
    }

    try {
      await dispatch(addToCart({ variantId, quantity })).unwrap();
      navigate("/checkout");
    } catch (e) {
      toast.error(e?.message || "Failed to add to cart");
    }
  }, [dispatch, variantId, quantity, navigate, isOutOfStock]);

  const ratingBreakdown = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of productReviews) {
      const k = Math.max(1, Math.min(5, Math.floor(Number(r?.rating || 0))));
      counts[k] += 1;
    }
    const total = productReviews.length || 0;
    return { counts, total };
  }, [productReviews]);

  if (!productLoading && !product) {
    return (
      <MainLayout>
        <div className="container-custom py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-primary hover:underline">
            Back to Shop
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-6 lg:py-12">
        <nav className="flex items-center gap-2 text-sm mb-6 lg:mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link
            to="/shop"
            className="text-muted-foreground hover:text-foreground"
          >
            Shop
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">
            {productLoading ? "Loading..." : product?.name}
          </span>
        </nav>

        {productLoading ? (
          <ProductSkeleton />
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="space-y-4">
                <div className="relative aspect-[4/5] lg:aspect-square max-h-[520px] lg:max-h-[640px] rounded-xl overflow-hidden bg-muted">
                  <img
                    src={
                      images[selectedImage] ||
                      "https://via.placeholder.com/600x800?text=No+Image"
                    }
                    alt={imageAlt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/600x800?text=No+Image";
                    }}
                  />

                  {images.length > 1 && (
                    <div className="absolute left-4 top-4 text-xs bg-background/90 rounded-full px-2 py-1 shadow-sm">
                      {selectedImage + 1}/{images.length}
                    </div>
                  )}

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/90 rounded-full shadow-md hover:bg-background transition-colors"
                        aria-label="Previous image"
                        title="Previous"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/90 rounded-full shadow-md hover:bg-background transition-colors"
                        aria-label="Next image"
                        title="Next"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          "shrink-0 w-16 h-20 lg:w-20 lg:h-24 rounded-lg overflow-hidden transition-all",
                          selectedImage === index
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "hover:ring-2 hover:ring-muted-foreground/30 hover:ring-offset-2 hover:ring-offset-background"
                        )}
                        aria-label={`Select image ${index + 1}`}
                        title="Add to Cart"
                      >
                        <img
                          src={image}
                          alt={`${imageAlt} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Info */}
            <Card>
              <CardHeader>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  {product?.brandName || product?.brandId?.name || ""}
                </p>

                <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mb-3">
                  {product?.name}
                </h1>

                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <RatingStars value={product?.rating ?? 0} />
                    <span className="text-sm text-muted-foreground">
                      {product?.rating ?? 0} ({product?.reviewCount ?? 0}{" "}
                      reviews)
                    </span>
                  </div>

                  {typeof stockAvailable === "number" && (
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        isOutOfStock
                          ? "bg-destructive/10 text-destructive"
                          : "bg-success/10 text-success"
                      )}
                    >
                      {isOutOfStock
                        ? "Out of stock"
                        : `In stock (${stockAvailable})`}
                    </span>
                  )}
                </div>

                <div className="flex items-end gap-3">
                  <span className="text-3xl font-semibold text-foreground">
                    {formatMoney(displayPrice, currency, locale)}
                  </span>

                  {displayOriginalPrice ? (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatMoney(displayOriginalPrice, currency, locale)}
                    </span>
                  ) : null}

                  {discountPct ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
                      {discountPct}% OFF
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Secure payment
                  </span>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="inline-flex items-center gap-1">
                    <RefreshCw className="w-4 h-4" /> Easy returns
                  </span>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Truck className="w-4 h-4" /> Fast delivery
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  {product?.shortDescription || product?.description || ""}
                </p>

                {/* Size */}
                {Array.isArray(product?.sizes) && product.sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground">Size</h3>
                      {selectedVariant?.size && (
                        <span className="text-xs text-muted-foreground">
                          Selected: {selectedVariant.size}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          type="button"
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            selectedSize === size
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          )}
                          aria-pressed={selectedSize === size}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color */}
                {Array.isArray(product?.colors) &&
                  product.colors.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-foreground">
                          Color:{" "}
                          <span className="text-muted-foreground">
                            {selectedColor}
                          </span>
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {product.colors.map((color) => (
                          <button
                            type="button"
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={cn(
                              "w-10 h-10 rounded-full transition-all",
                              selectedColor === color.name
                                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                : "hover:ring-2 hover:ring-muted-foreground/30 hover:ring-offset-2 hover:ring-offset-background"
                            )}
                            style={{ backgroundColor: color.hex }}
                            aria-label={color.name}
                            aria-pressed={selectedColor === color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                {/* Quantity */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground">Quantity</h3>
                    {typeof stockAvailable === "number" && (
                      <span className="text-xs text-muted-foreground">
                        Max: {maxQty}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-muted rounded-md">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-3 hover:bg-muted/80 transition-colors rounded-l-md"
                        aria-label="Decrease quantity"
                        disabled={isOutOfStock}
                        title="Decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-12 text-center font-medium">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) => Math.min(maxQty, q + 1))
                        }
                        className="p-3 hover:bg-muted/80 transition-colors rounded-r-md"
                        aria-label="Increase quantity"
                        disabled={isOutOfStock}
                        title="Increase"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={cartLoading || isOutOfStock}
                    aria-busy={cartLoading ? "true" : "false"}
                    className={cn(btnBase, btnLg, btnPrimary, "flex-1")}
                    title="Add to Cart"
                  >
                    {isOutOfStock
                      ? "Out of stock"
                      : cartLoading
                      ? "Adding..."
                      : "Add to Cart"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={cartLoading || isOutOfStock}
                    className={cn(btnBase, btnLg, btnSecondary, "flex-1")}
                  >
                    Buy Now
                  </button>

                  <button
                    type="button"
                    className={cn(btnBase, btnLg, btnOutline, "sm:w-auto")}
                    aria-label="Add to wishlist"
                    title="Add to Cart"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                {/* Features (no border) */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                  <div className="text-center">
                    <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Free Shipping
                    </p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Secure Payment
                    </p>
                  </div>
                  <div className="text-center">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Easy Returns
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs (no borders) */}
        {!productLoading && product && (
          <Card className="mt-12 lg:mt-16">
            <CardHeader className="bg-muted/30 rounded-t-xl">
              <div className="flex gap-6 lg:gap-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "pb-4 pt-4 text-sm font-medium transition-colors relative whitespace-nowrap px-2",
                      activeTab === tab
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="py-8">
              {activeTab === "Description" && (
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">
                    {product?.description ?? ""}
                  </p>
                </div>
              )}

              {activeTab === "Specifications" && (
                <>
                  {Array.isArray(product?.specifications) &&
                  product.specifications.length > 0 ? (
                    <div className="grid gap-3 max-w-2xl">
                      {product.specifications.map((spec) => (
                        <div
                          key={spec.label}
                          className="flex justify-between gap-6 py-3 bg-muted/30 rounded-lg px-4"
                        >
                          <span className="text-muted-foreground">
                            {spec.label}
                          </span>
                          <span className="font-medium text-foreground text-right">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No specifications available.
                    </p>
                  )}
                </>
              )}

              {activeTab === "Reviews" && (
                <div className="space-y-8">
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="rounded-xl bg-muted/30 p-5">
                      <div className="text-3xl font-semibold">
                        {Number(product?.rating ?? 0).toFixed(1)}
                      </div>
                      <RatingStars
                        value={product?.rating ?? 0}
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Based on {ratingBreakdown.total} reviews
                      </p>
                    </div>

                    <div className="lg:col-span-2 rounded-xl bg-muted/30 p-5">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((k) => {
                          const count = ratingBreakdown.counts[k];
                          const total = ratingBreakdown.total || 1;
                          const pct = Math.round((count / total) * 100);
                          return (
                            <div key={k} className="flex items-center gap-3">
                              <div className="w-10 text-sm text-muted-foreground">
                                {k}★
                              </div>
                              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="w-12 text-right text-sm text-muted-foreground">
                                {count}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {productReviews.length === 0 ? (
                    <p className="text-muted-foreground">No reviews yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {productReviews.map((review) => (
                        <div
                          key={review._id || review.legacyId}
                          className="bg-muted/20 rounded-xl p-5"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <RatingStars value={review.rating || 0} />
                            {review.verified && (
                              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">
                                Verified Purchase
                              </span>
                            )}
                          </div>

                          <h4 className="font-medium text-foreground">
                            {review.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {review.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {review.author} •{" "}
                            {review.date
                              ? new Date(review.date).toLocaleDateString(
                                  "en-US"
                                )
                              : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Related */}
        {!productLoading && relatedProducts.length > 0 && (
          <section className="mt-12 lg:mt-16">
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-6 lg:mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Buy Bar (no border, shadow only) */}
      {!productLoading && product && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 shadow-lg bg-background/95 backdrop-blur">
          <div className="container-custom py-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="font-semibold">
                {formatMoney(displayPrice, currency, locale)}
              </div>
            </div>

            {/* ✅ Only change requested: button text */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={cartLoading || isOutOfStock}
              className={cn(btnBase, "h-11 px-4", btnPrimary)}
              title="Add to Cart"
            >
              {isOutOfStock ? "Out of stock" : "Add to Cart"}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={cartLoading || isOutOfStock}
              className={cn(btnBase, "h-11 px-4", btnSecondary)}
            >
              Buy Now
            </button>
          </div>
        </div>
      )}

      {!productLoading && product && <div className="lg:hidden h-20" />}
    </MainLayout>
  );
}
