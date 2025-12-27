import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import ProductCard from "../components/product/productCard";
import { cn } from "../lib/util";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsThunk, fetchCategoriesThunk } from "../store/storSlice";

const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "Over $200", min: 200, max: Infinity },
];

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
];

const ratingFilters = [
  { label: "4+ Stars", value: 4 },
  { label: "3+ Stars", value: 3 },
  { label: "All Ratings", value: 0 },
];

// --- UI: chip ---
function Pill({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-foreground text-xs">
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-0.5 rounded hover:bg-background/60"
          aria-label="Remove filter"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
}

// --- Debounce ---
function useDebounce(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

// --- Scroll restore helper ---
function useScrollRestoration(key = "shop_scroll") {
  useEffect(() => {
    const onScroll = () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [key]);

  const restoredRef = useRef(false);

  const restore = () => {
    if (restoredRef.current) return;
    const y = Number(sessionStorage.getItem(key) || 0);
    if (y > 0) {
      restoredRef.current = true;
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  };

  return { restore };
}

export default function ShopPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    products,
    productsMeta,
    productsLoading,
    categories,
    categoriesLoading,
    error,
  } = useSelector((s) => s.store);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Scroll restore
  const scrollKey = "shop_scroll";
  const { restore } = useScrollRestoration(scrollKey);

  // Init from URL
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "featured";

  const initialPageFromUrl = Number(searchParams.get("page") || 1);
  const safeInitialPage =
    Number.isFinite(initialPageFromUrl) && initialPageFromUrl > 0
      ? initialPageFromUrl
      : 1;

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState(initialSort);

  // Pagination
  const [page, setPage] = useState(safeInitialPage);
  const limit = 12;

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Load categories once
  useEffect(() => {
    dispatch(fetchCategoriesThunk({ withCounts: true }));
  }, [dispatch]);

  // Keep page in sync if user uses browser back/forward
  useEffect(() => {
    const urlPage = Number(searchParams.get("page") || 1);
    const safeUrlPage = Number.isFinite(urlPage) && urlPage > 0 ? urlPage : 1;
    if (safeUrlPage !== page) setPage(safeUrlPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Fetch products (depends on page + filters)
  useEffect(() => {
    const pr = priceRanges[selectedPriceRange];

    dispatch(
      fetchProductsThunk({
        q: debouncedSearch || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        minPrice: pr.min !== 0 ? pr.min : undefined,
        maxPrice: pr.max !== Infinity ? pr.max : undefined,
        minRating: selectedRating > 0 ? selectedRating : undefined,
        sort: sortBy || "newest",
        page,
        limit,
      })
    );
  }, [
    dispatch,
    selectedCategory,
    debouncedSearch,
    selectedPriceRange,
    selectedRating,
    sortBy,
    page,
  ]);

  // Filters change -> page reset to 1 + URL update
  const firstRenderRef = useRef(true);
  useEffect(() => {
    // skip first render (because we already loaded from URL)
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    // when filters change, set page=1
    if (page !== 1) setPage(1);

    const next = new URLSearchParams(searchParams);
    next.set("page", "1");
    setSearchParams(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategory,
    debouncedSearch,
    selectedPriceRange,
    selectedRating,
    sortBy,
  ]);

  // Restore scroll once after first load (when coming back from product)
  const restoredOnce = useRef(false);
  useEffect(() => {
    if (!productsLoading && !restoredOnce.current) {
      restoredOnce.current = true;
      setTimeout(() => restore(), 0);
    }
  }, [productsLoading, restore]);

  const filteredProducts = useMemo(() => products || [], [products]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    const nextParams = new URLSearchParams(searchParams);
    if (category === "all") nextParams.delete("category");
    else nextParams.set("category", category);

    // reset page
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSelectedPriceRange(0);
    setSelectedRating(0);
    setSortBy("featured");
    setPage(1);
    setSearchParams({ page: "1" });
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchQuery ||
    selectedPriceRange !== 0 ||
    selectedRating !== 0 ||
    (sortBy && sortBy !== "featured");

  // Pagination helpers
  const totalPages = Math.max(1, Number(productsMeta?.pages || 1));

  const goToPage = (p) => {
    const nextPage = Math.max(1, Math.min(totalPages, Number(p || 1)));

    setPage(nextPage);

    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);

    // (optional) If you want scroll to top on page change:
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Active chips
  const activeChips = useMemo(() => {
    const chips = [];

    if (selectedCategory !== "all") {
      const catName =
        (categories || []).find((c) => (c.key || c._id) === selectedCategory)
          ?.name || "Category";

      chips.push({
        key: "cat",
        label: `Category: ${catName}`,
        onRemove: () => handleCategoryChange("all"),
      });
    }

    if (searchQuery) {
      chips.push({
        key: "q",
        label: `Search: ${searchQuery}`,
        onRemove: () => setSearchQuery(""),
      });
    }

    if (selectedPriceRange !== 0) {
      chips.push({
        key: "price",
        label: `Price: ${priceRanges[selectedPriceRange].label}`,
        onRemove: () => setSelectedPriceRange(0),
      });
    }

    if (selectedRating !== 0) {
      chips.push({
        key: "rating",
        label: `Rating: ${selectedRating}+`,
        onRemove: () => setSelectedRating(0),
      });
    }

    if (sortBy && sortBy !== "featured") {
      const label =
        sortOptions.find((s) => s.value === sortBy)?.label || sortBy;
      chips.push({
        key: "sort",
        label: `Sort: ${label}`,
        onRemove: () => setSortBy("featured"),
      });
    }

    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategory,
    categories,
    searchQuery,
    selectedPriceRange,
    selectedRating,
    sortBy,
  ]);

  // Save scroll before leaving page
  const saveScrollNow = () => {
    sessionStorage.setItem(scrollKey, String(window.scrollY));
  };

  return (
    <MainLayout>
      <div className="container-custom py-8 lg:py-12">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground">
              Shop
            </h1>

            <p className="text-muted-foreground">
              {productsLoading
                ? "Loading products..."
                : error
                ? error
                : `${
                    productsMeta?.total ?? filteredProducts.length
                  } products found`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                On
              </span>
            )}
          </button>
        </div>

        {/* Search + Sort */}
        <div className="grid lg:grid-cols-[1fr_220px] gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);

                const next = new URLSearchParams(searchParams);
                if (!val) next.delete("search");
                else next.set("search", val);

                // reset page
                next.set("page", "1");
                setSearchParams(next);
              }}
              placeholder="Search products..."
              className="input-field pl-10 pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  const next = new URLSearchParams(searchParams);
                  next.delete("search");
                  next.set("page", "1");
                  setSearchParams(next);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                const val = e.target.value;
                setSortBy(val);

                const next = new URLSearchParams(searchParams);
                if (!val || val === "featured") next.delete("sort");
                else next.set("sort", val);

                next.set("page", "1");
                setSearchParams(next);
              }}
              className="input-field appearance-none cursor-pointer pr-10"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Active chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-muted-foreground mr-1">Active:</span>
            {activeChips.map((c) => (
              <Pill key={c.key} onRemove={c.onRemove}>
                {c.label}
              </Pill>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-primary hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside
            className={cn(
              "lg:sticky lg:top-24 lg:self-start",
              "bg-card rounded-2xl shadow-sm border border-border",
              "h-fit",
              "fixed lg:static inset-y-0 left-0 z-50 w-[86%] max-w-sm lg:w-auto",
              "transition-transform duration-300",
              isFilterOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            )}
          >
            <div className="p-5 lg:p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between lg:hidden mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Filters
                </h2>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-7">
                <h3 className="font-semibold text-foreground mb-3">
                  Categories
                </h3>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("all")}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition",
                      selectedCategory === "all"
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All Products
                  </button>

                  {!categoriesLoading &&
                    (categories || []).map((cat) => {
                      const key = cat.key || cat._id;
                      const active = selectedCategory === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleCategoryChange(key)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between",
                            active
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span>{cat.name}</span>
                          {typeof cat.count === "number" && (
                            <span className="text-xs text-muted-foreground">
                              {cat.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Price */}
              <div className="mb-7">
                <h3 className="font-semibold text-foreground mb-3">Price</h3>
                <div className="space-y-1">
                  {priceRanges.map((range, idx) => {
                    const active = selectedPriceRange === idx;
                    return (
                      <button
                        key={range.label}
                        type="button"
                        onClick={() => {
                          setSelectedPriceRange(idx);
                          const next = new URLSearchParams(searchParams);
                          next.set("page", "1");
                          setSearchParams(next);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition",
                          active
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-7">
                <h3 className="font-semibold text-foreground mb-3">Rating</h3>
                <div className="space-y-1">
                  {ratingFilters.map((f) => {
                    const active = selectedRating === f.value;
                    return (
                      <button
                        key={f.label}
                        type="button"
                        onClick={() => {
                          setSelectedRating(f.value);
                          const next = new URLSearchParams(searchParams);
                          next.set("page", "1");
                          setSearchParams(next);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition",
                          active
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="lg:hidden w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium"
              >
                Apply filters
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 w-full py-3 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition lg:hidden"
                >
                  Clear all
                </button>
              )}
            </div>
          </aside>

          {isFilterOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
          )}

          {/* Products */}
          <div className="min-w-0">
            {!productsLoading && filteredProducts.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <p className="text-lg text-foreground font-medium mb-2">
                  No products found
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Try clearing filters or searching something else.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product._id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${(index % 6) * 0.05}s` }}
                      onMouseDown={saveScrollNow}
                      onTouchStart={saveScrollNow}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/*  Pagination */}
                {!productsLoading && totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      className={cn(
                        "px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition",
                        page <= 1 && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      Prev
                    </button>

                    {/* Page numbers (max 5) */}
                    {(() => {
                      const maxBtns = 5;
                      let start = Math.max(1, page - 2);
                      let end = Math.min(totalPages, start + (maxBtns - 1));
                      start = Math.max(1, end - (maxBtns - 1));

                      return Array.from({ length: end - start + 1 }).map(
                        (_, i) => {
                          const p = start + i;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => goToPage(p)}
                              className={cn(
                                "w-10 h-10 rounded-lg border border-border transition",
                                p === page
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-card hover:bg-muted/50"
                              )}
                            >
                              {p}
                            </button>
                          );
                        }
                      );
                    })()}

                    <button
                      type="button"
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages}
                      className={cn(
                        "px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition",
                        page >= totalPages && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
